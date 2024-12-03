const video = document.getElementById("video");
const captureButton = document.getElementById("capture-button");
const submitButton = document.getElementById("submit-button");
const outputImage = document.getElementById("output-image");
const canvas = document.createElement("canvas");

// Access the webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        console.log("Webcam access granted");
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Error accessing webcam:", err);
    });

// Event listener for the capture button
captureButton.addEventListener("click", () => {
    console.log("Capture button clicked");

    // Ensure video dimensions are set before drawing to canvas
    canvas.width = video.videoWidth || 640;  // Default width if video is not loaded yet
    canvas.height = video.videoHeight || 480;  // Default height if video is not loaded yet
    const context = canvas.getContext("2d");
    
    // Draw the current frame of the video to the canvas
    context.drawImage(video, 0, 0);
    console.log("Image drawn to canvas");

    // Replace webcam feed with captured image
    video.style.display = "none";
    captureButton.style.display = "none";
    
    const capturedImage = canvas.toDataURL("image/jpeg", 0.7);  // Compress the image

    // Display the captured image on the page
    const imgElement = document.createElement("img");
    imgElement.src = capturedImage;
    imgElement.id = "captured-img";
    imgElement.className = "border";
    video.parentNode.insertBefore(imgElement, video.nextSibling);

    submitButton.dataset.image = capturedImage;
    submitButton.disabled = false;
});

submitButton.addEventListener("click", () => {
    const imageData = submitButton.dataset.image.split(",")[1];

    // Ensure the image size is below acceptable limits before sending
    const byteSize = (imageData.length * 3) / 4;  // Calculate size of base64 string
    if (byteSize > 10 * 1024 * 1024) {  // Limit to 10 MB (adjust as needed)
        alert("Image is too large. Please capture a smaller image.");
        return;
    }

    fetch("/process_image", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `image=${encodeURIComponent(imageData)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            outputImage.src = `data:image/png;base64,${data.processed_image}`;
            outputImage.style.display = "block";
        } else {
            alert("Background removal failed: " + data.error);
        }
    })
    .catch(err => {
        console.error("Error processing image:", err);
    });
});
