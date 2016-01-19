<?php
$valid_formats = array("jpg", "png", "gif", "zip", "bmp");
$max_file_size = 1024*100; //100 kb
$path = "Images/"; // Upload directory
$count = 0;

if(isset($_POST) and $_SERVER['REQUEST_METHOD'] == "POST"){
	// Loop $_FILES to exeicute all files
	foreach ($_FILES['file']['name'] as $f => $name) {     
	    if ($_FILES['file']['error'][$f] == 4) {
	        continue; // Skip file if any error found
	    }	       
	    if ($_FILES['file']['error'][$f] == 0) {	           
	        if ($_FILES['file']['size'][$f] > $max_file_size) {
	            $message[] = "$name is too large!.";
	            continue; // Skip large files
	        }
			elseif( ! in_array(pathinfo($name, PATHINFO_EXTENSION), $valid_formats) ){
				$message[] = "$name is not a valid format";
				continue; // Skip invalid file formats
			}
	        else{ // No error found! Move uploaded files 
	            if(move_uploaded_file($_FILES["file"]["tmp_name"][$f], $path.$name))
	            $count++; // Number of successfully uploaded file
	        }
	    }
	}
	echo $count ;

}
/*$target_path = "Images/";
for($i=0; $i<count($_FILES['file']['name']); $i++){
    $ext = explode('.', basename( $_FILES['file']['name'][$i]));
    $target_path = $target_path . md5(uniqid()) . "." . $ext[count($ext)-1]; 

    if(move_uploaded_file($_FILES['file']['tmp_name'][$i], $target_path)) {
        echo "The file has been uploaded successfully <br />";
    } else{
        echo "There was an error uploading the file, please try again! <br />";
    }
}*/
?>