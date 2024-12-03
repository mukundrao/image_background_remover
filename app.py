from flask import Flask, request, jsonify, render_template
import requests
import base64

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 22 * 1024 * 1024  # 22 MB limit

@app.errorhandler(413)
def request_entity_too_large(e):
    return jsonify({"success": False, "error": "Uploaded image exceeds size limit."}), 413

def remove_background(image_base64):
    api_key = "AYRcJQhVZsLY8EcMrMw4RCBR"  # Replace with your Remove.bg API key
    # Convert base64 string to binary data
    image_data = base64.b64decode(image_base64)
    
    response = requests.post(
        "https://api.remove.bg/v1.0/removebg",
        headers={"X-Api-Key": api_key},
        files={"image_file": image_data},
        data={"size": "auto"}
    )
    
    if response.status_code == 200:
        return base64.b64encode(response.content).decode("utf-8")
    else:
        print(f"Error from API: {response.status_code}, {response.text}")
        return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process_image", methods=["POST"])
def process_image():
    try:
        # Get base64 image data from the request
        image_data = request.form["image"]
        
        # Call the Remove.bg API to remove background
        processed_image = remove_background(image_data)
        
        if processed_image:
            return jsonify({"success": True, "processed_image": processed_image})
        else:
            return jsonify({"success": False, "error": "Failed to remove background."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)

