<?php
// Robust CORS handling for dynamic Vercel preview URLs
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-File-Name, X-File-Size");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$base_dir = "media/videos/";
$course_folder = isset($_POST['course_folder']) ? preg_replace("/[^a-zA-Z0-9\/_-]/", "_", $_POST['course_folder']) : "general";
$target_dir = $base_dir . $course_folder . "/";
$response = array();

// Create directory if it doesn't exist
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES["file"])) {
        $file_name = basename($_FILES["file"]["name"]);
        // Clean filename: remove spaces and special characters
        $file_name = preg_replace("/[^a-zA-Z0-9.]/", "_", $file_name);
        $target_file = $target_dir . time() . "_" . $file_name;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            $response['status'] = 'success';
            $response['url'] = "https://smartonlinelearningedu.com/" . $target_file;
            $response['message'] = "File uploaded successfully.";
        } else {
            $error = error_get_last();
            $response['status'] = 'error';
            $response['message'] = "Upload failed. Please check server permissions or file size limits.";
            if ($error) {
                $response['debug_info'] = $error['message'];
            }
        }
    } else {
        $response['status'] = 'error';
        $response['message'] = "No file was uploaded.";
    }
} else {
    $response['status'] = 'error';
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
?>
