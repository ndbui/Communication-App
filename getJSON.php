<?php
$myFile = $_POST["fileName"];

$jsondata = file_get_contents($myFile);
$obj = json_decode($jsondata);
echo $obj
?>