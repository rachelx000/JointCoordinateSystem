import { useRef, useState } from "react";
import Papa from "papaparse";

export default function UploadFileHandler({ setUploadedData }) {
    const [message, setMessage] = useState({type: "", content: ""});
    const fileRef = useRef(null);

    function handleUploadFile(e) {
        fileRef.current = e.target.files[0];
    }

    function handleSubmission() {
        let parsedData = [];
        let skippedLines = 0;
        let file = fileRef.current;
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
                            setMessage({type: "Error", content: "All data rows contain either null or non-numeric elements"});
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
                    setMessage({type: "Success", content: "Uploaded: "+fileRef.current.name });
                },
                error: (err) => {
                    setMessage({type: "Error", content: "Failed to parse: "+err.message });
                },
            }
        )
    }

    return (
        <div id="custom-data">
            <label htmlFor="data-upload">Upload a file <span style={{ fontWeight: '700' }}>(.csv only and {"<="} 1MB)</span>: </label>
            <input name="data-upload" id="data-upload" type="file" accept=".csv" onChange={ handleUploadFile }/>
            <br/>
            <br/>
            <input type="submit" value="Submit" onClick={ handleSubmission }/>
            <span id="error-message" style={{ color: message.type === "Success" ? "#000" : "#d8315b"}}>   {message.content}</span>
        </div>
    )
}