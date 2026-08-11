import { useState } from "react";
import API from "../services/api";

function UploadNotes() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadFile = async () => {
    if (!file) {
      alert("Select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        📤 Upload Notes
      </h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={uploadFile}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {message && (
        <p className="mt-4 text-green-600 font-semibold">
          {message}
        </p>
      )}

    </div>
  );
}

export default UploadNotes;