<?php
session_start();
require_once 'config.php';
if (DATA_DRIVER === 'supabase') {
    require_once __DIR__ . '/supabase.php';
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if user is authenticated as admin (use the same session key as auth.php)
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration
$uploadDir = '../produk/';
$maxImageFileSize = 5 * 1024 * 1024; // 5MB untuk gambar
$maxVideoFileSize = 50 * 1024 * 1024; // 50MB untuk video
$maxFiles = 5;
$allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
$allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
$allowedVideoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

// Create base and date-based subdirectories (local) OR prepare Supabase storage path
$year = date('Y');
$month = date('m');
if (DATA_DRIVER !== 'supabase') {
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create base upload directory']);
        exit;
    }
    $subDir = rtrim($uploadDir, '/')."/$year/$month/";
    if (!is_dir($subDir) && !mkdir($subDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create subdirectory']);
        exit;
    }
} else {
    // Supabase: path akan menjadi "$year/$month/filename" di bucket SUPABASE_BUCKET
    $subDir = "$year/$month/";
}

// Check if files were uploaded (images and/or videos)
$filesImages = isset($_FILES['images']) ? $_FILES['images'] : null;
$filesVideos = isset($_FILES['videos']) ? $_FILES['videos'] : null;
if ((!$filesImages || empty($filesImages['name'][0])) && (!$filesVideos || empty($filesVideos['name'][0]))) {
    http_response_code(400);
    echo json_encode(['error' => 'No files uploaded']);
    exit;
}

$uploadedFiles = [];
$errors = [];

// Process each uploaded file
$countImages = $filesImages ? count($filesImages['name']) : 0;
$countVideos = $filesVideos ? count($filesVideos['name']) : 0;
$fileCount = $countImages + $countVideos;

if ($fileCount > $maxFiles) {
    http_response_code(400);
    echo json_encode(['error' => "Maximum $maxFiles files allowed"]);
    exit;
}

for ($i = 0; $i < $fileCount; $i++) {
    $isImageIdx = $filesImages && $i < $countImages;
    $src = $isImageIdx ? $filesImages : $filesVideos;
    $offset = $isImageIdx ? $i : ($i - $countImages);
    $fileName = $src['name'][$offset];
    $fileTmpName = $src['tmp_name'][$offset];
    $fileSize = $src['size'][$offset];
    $fileError = $src['error'][$offset];
    $fileType = $src['type'][$offset];

    // Skip empty files
    if (empty($fileName)) {
        continue;
    }

    // Check for upload errors
    if ($fileError !== UPLOAD_ERR_OK) {
        $errors[] = "Upload error for file $fileName: " . getUploadErrorMessage($fileError);
        continue;
    }

    // Determine MIME type for validation
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedType = finfo_file($finfo, $fileTmpName);
    finfo_close($finfo);

    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $isImage = in_array($detectedType, $allowedImageTypes) || in_array($fileExtension, $allowedImageExtensions);
    $isVideo = in_array($detectedType, $allowedVideoTypes) || in_array($fileExtension, $allowedVideoExtensions);

    if (!$isImage && !$isVideo) {
        $errors[] = "File $fileName has invalid type: $detectedType";
        continue;
    }

    // Check file size per type
    if ($isImage && $fileSize > $maxImageFileSize) {
        $errors[] = "File $fileName exceeds maximum size of " . formatBytes($maxImageFileSize);
        continue;
    }
    if ($isVideo && $fileSize > $maxVideoFileSize) {
        $errors[] = "File $fileName exceeds maximum size of " . formatBytes($maxVideoFileSize);
        continue;
    }

    // Check file extension per type
    if ($isImage && !in_array($fileExtension, $allowedImageExtensions)) {
        $errors[] = "File $fileName has invalid extension. Allowed: " . implode(', ', $allowedImageExtensions);
        continue;
    }
    if ($isVideo && !in_array($fileExtension, $allowedVideoExtensions)) {
        $errors[] = "File $fileName has invalid extension. Allowed: " . implode(', ', $allowedVideoExtensions);
        continue;
    }

    // Generate unique filename
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
    $baseName = substr($baseName, 0, 50); // Limit length
    
    if (empty($baseName)) {
        $baseName = $isImage ? 'image' : 'video';
    }

    $newFileName = $baseName . '_' . time() . '_' . uniqid() . '.' . $fileExtension;
    $targetPath = $subDir . $newFileName;

    if (DATA_DRIVER === 'supabase') {
        // Upload to Supabase Storage using PUT raw body
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            $errors[] = 'Supabase belum dikonfigurasi (SUPABASE_URL/SERVICE_ROLE_KEY)';
        } else {
            $storagePath = $subDir . $newFileName; // e.g., 2025/10/abc.jpg
            $urlPath = '/storage/v1/object/' . rawurlencode(trim(SUPABASE_BUCKET, '/')) . '/' . $storagePath;

            $ch = curl_init(rtrim(SUPABASE_URL, '/') . $urlPath);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type: ' . $detectedType,
                'x-upsert: false'
            ]);
            $data = file_get_contents($fileTmpName);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            $resp = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            if ($err || $status >= 400) {
                $errors[] = "Failed to upload to Supabase for $fileName: HTTP $status $err";
            } else {
                $uploadedFiles[] = [
                    'original_name' => $fileName,
                    'filename' => $newFileName,
                    'path' => supaPublicUrl(SUPABASE_BUCKET, $storagePath),
                    'size' => $fileSize,
                    'type' => $detectedType
                ];
            }
        }
    } else {
        // Move uploaded file locally
        if (move_uploaded_file($fileTmpName, $targetPath)) {
            // Optimize image (optional - requires GD extension)
            optimizeImage($targetPath, $fileExtension);
            
            $uploadedFiles[] = [
                'original_name' => $fileName,
                'filename' => $newFileName,
                'path' => 'produk/' . $year . '/' . $month . '/' . $newFileName,
                'size' => $fileSize,
                'type' => $detectedType
            ];
        } else {
            $errors[] = "Failed to move file $fileName";
        }
    }
}

// Return response
$response = [
    'success' => !empty($uploadedFiles),
    'uploaded_files' => $uploadedFiles,
    'errors' => $errors,
    'total_uploaded' => count($uploadedFiles),
    'total_errors' => count($errors)
];

if (!empty($uploadedFiles)) {
    echo json_encode($response);
} else {
    http_response_code(400);
    echo json_encode($response);
}

// Helper functions
function getUploadErrorMessage($errorCode) {
    switch ($errorCode) {
        case UPLOAD_ERR_INI_SIZE:
            return 'File exceeds upload_max_filesize directive';
        case UPLOAD_ERR_FORM_SIZE:
            return 'File exceeds MAX_FILE_SIZE directive';
        case UPLOAD_ERR_PARTIAL:
            return 'File was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'File upload stopped by extension';
        default:
            return 'Unknown upload error';
    }
}

function formatBytes($size, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    return round($size, $precision) . ' ' . $units[$i];
}

function optimizeImage($filePath, $extension) {
    if (!extension_loaded('gd')) {
        return false;
    }

    $maxWidth = 1200;
    $maxHeight = 1200;
    $quality = 85;

    // Get image dimensions
    list($width, $height) = getimagesize($filePath);
    
    // Skip if image is already small enough
    if ($width <= $maxWidth && $height <= $maxHeight) {
        return true;
    }

    // Calculate new dimensions
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = intval($width * $ratio);
    $newHeight = intval($height * $ratio);

    // Create image resource
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            $source = imagecreatefromjpeg($filePath);
            break;
        case 'png':
            $source = imagecreatefrompng($filePath);
            break;
        case 'webp':
            $source = imagecreatefromwebp($filePath);
            break;
        default:
            return false;
    }

    if (!$source) {
        return false;
    }

    // Create new image
    $destination = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG
    if ($extension === 'png') {
        imagealphablending($destination, false);
        imagesavealpha($destination, true);
        $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
        imagefilledrectangle($destination, 0, 0, $newWidth, $newHeight, $transparent);
    }

    // Resize image
    imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // Save optimized image
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            imagejpeg($destination, $filePath, $quality);
            break;
        case 'png':
            imagepng($destination, $filePath, 9);
            break;
        case 'webp':
            imagewebp($destination, $filePath, $quality);
            break;
    }

    // Clean up
    imagedestroy($source);
    imagedestroy($destination);

    return true;
}
?>