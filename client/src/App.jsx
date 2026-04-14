import { useState } from "react";
import axios from "axios";

function App() {
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const missingKeywords = Array.isArray(result?.missing_keywords)
    ? result.missing_keywords
    : [];

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setIsUploading(true);
    setError("");
    setResult(null);

    try {
      formData.append("jobDesc", jobDesc);
      const res = await axios.post("http://localhost:3000/upload", formData);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Upload failed. Make sure the server and ML service are running."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Resume Analyzer</h1>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          setFile(e.target.files[0] || null);
          setResult(null);
          setError("");
        }}
      />
      <textarea
  placeholder="Paste job description here..."
  rows={6}
  style={{ width: "300px", display: "block", marginTop: "10px" }}
  onChange={(e) => setJobDesc(e.target.value)}
  />

      <button disabled={isUploading} onClick={handleUpload}>
        {isUploading ? "Analyzing..." : "Upload"}
      </button>

      {file && <p>Selected: {file.name}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div>
          <h2>Score: {result.score}</h2>
          <p>
            Missing:{" "}
            {missingKeywords.length > 0 ? missingKeywords.join(", ") : "None found"}
          </p>
          <p>{result.suggestions}</p>
        </div>
      )}
    </div>
  );
}

export default App;
