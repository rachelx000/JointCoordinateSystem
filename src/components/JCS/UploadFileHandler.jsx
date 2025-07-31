import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function UploadFileHandler({ uploadedData, setUploadedData }) {
    const [message, setMessage] = useState({type: "", content: ""});

    function handleFileUpload(e) {
        let parsedData = [];
        let skippedLines = 0;
        let file = e.target.files[0];
        // Check if the file is empty or not valid
        if (!file || file.size === 0) {
            setMessage({ type: "Error", content: "File is empty or undefined" });
            return;
        }

        // Check if the file size doesn't exceed 1MB (1e+6 bytes)
        if (file.size > 1e+6) {
            setMessage({type: "Error", content: "File is larger than 1MB"})
            return;
        }

        Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: false,
                escapeFormulae: true,
                step: (result) => {
                    let row = result.data;
                    let ifContainNullorNonNum = Object.values(row).some(value => value === ""
                        || value === undefined || value === null || typeof value !== "number");
                    ifContainNullorNonNum ? skippedLines++ : parsedData.push(row);
                },
                complete: () => {
                    // Check if the data field is not empty
                    if (parsedData.length === 0) {
                        if (skippedLines > 0) {
                            setMessage({type: "Error", content: "There are null or non-numeric variable(s)"});
                        } else {
                            setMessage({type: "Error", content: "The data field is empty"});
                        }
                        return;
                    }

                    // Check if the csv contains >= 5 variables
                    const header = Object.keys(parsedData[0]);
                    if (header.length <= 4) {
                        setMessage({type: "Error", content: "File has less than five variables"})
                        return;
                    }

                    setUploadedData(parsedData);
                    // console.log("Parsed data:", parsedData);
                    setMessage({type: "Success", content: "Uploaded: "+file.name });
                },
                error: (err) => {
                    setMessage({type: "Error", content: "Failed to parse: "+err.message });
                },
            }
        )
    }

    useEffect(() => {
        if (uploadedData === null) {
            document.getElementById("data-upload").value = "";
            setMessage({type: "", content: ""});
        }
    }, [uploadedData])

    return (
        <div id="custom-data">
            <label htmlFor="data-upload">Upload a file <span style={{ fontWeight: '700' }}>(.csv only and {"<="} 1MB)</span>: </label>
            <input name="data-upload" id="data-upload" type="file" accept=".csv" onChange={ handleFileUpload } />
            <p id="error-message" style={{ color: message.type === "Success" ? "#218380" : "#d8315b"}}>{message.content}</p>
        </div>
    )
}