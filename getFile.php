<?php
$files = scandir("Images/");
echo json_encode($files);
?>