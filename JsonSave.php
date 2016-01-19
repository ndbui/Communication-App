<?php
  $myFile = $_POST["file"];
  $fh = fopen($myFile, 'w') or die("can't open file");
  $stringData = json_encode($_POST["data"]);
  fwrite($fh, $stringData);
  fclose($fh);
?>