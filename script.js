document.addEventListener("DOMContentLoaded", function () {
    const testCases = [
        {
            category: "Enabling Offline Mode",
            tests: [
                "Disconnect the terminal from Wi-Fi and mobile data.",
                "Attempt a network connection test and confirm failure is handled properly.",
                "Verify the terminal enters offline mode and displays an appropriate status message."
            ]
        },
        {
            category: "Processing Offline Transactions",
            tests: [
                "Insert a chip card and process a sale while offline.",
                "Swipe a magnetic stripe card and verify offline approval.",
                "Tap an NFC-enabled card and confirm the transaction is stored for later upload.",
                "Manually enter a card number and check if the transaction is accepted offline."
            ]
        },
        {
            category: "Transaction Approval and Receipt Printing",
            tests: [
								"Verify that offline transactions receive a locally approved response.",
								"Confirm that a receipt is printed with an \"Offline Approved\" message.",
								"Check if the receipt contains a disclaimer about the pending status of the transaction."
            ]
        },
        {
            category: "Transaction Storage and Limits",
            tests: [
								"Perform multiple offline transactions and ensure they are stored securely.",
								"Test reaching the offline transaction limit and verify the proper error message appears.",
								"Check that stored transactions include accurate timestamps and amounts."
            ]
        },
        {
            category: "Restoring Internet Connection",
            tests: [
								"Reconnect the terminal to Wi-Fi or mobile data.",
								"Verify that the terminal detects connectivity restoration automatically.",
								"Confirm that stored offline transactions begin uploading to the payment processor.",
								"Check that the terminal updates the status of pending transactions correctly."
            ]
       },
       {
            category: "Offline Transaction Upload Confirmation",
            tests: [
								"Verify that each transaction receives a final confirmation response from the server.",
								"Ensure that successful uploads are removed from the offline queue.",
								"Check that receipts for uploaded transactions can be reprinted from the transaction history."
            ]
       },
       {
            category: "Error Handling & Edge Cases",
            tests: [
								"Simulate a declined transaction while in offline mode and verify handling.",
								"Try to force an offline refund and confirm whether it is allowed or restricted.",
								"Interrupt the terminal's power during an offline transaction and check data recovery.",
								"Test a network outage during the upload process and ensure retries function correctly."
            ]
       },
       {
            category: "Final Review",
            tests: [
								"Document all test results and report any unexpected behavior.",
								"Verify that all offline transactions are successfully uploaded before concluding testing."
            ]
       }
    ];

    const checklistContainer = document.getElementById("checklist");

    // Create a container for the input and button
    const inputButtonContainer = document.createElement("div");
    inputButtonContainer.style.marginBottom = "20px";

    // Create the QA name input field
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Enter QA Name";
    nameInput.style.marginBottom = "10px";
    nameInput.style.padding = "10px";
    nameInput.style.fontSize = "16px";
    nameInput.style.width = "200px";
    nameInput.style.border = "1px solid #ccc";
    nameInput.style.borderRadius = "5px";

    // Create the download button
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download PDF";
    downloadButton.disabled = false;
    downloadButton.style.padding = "10px";
    downloadButton.style.fontSize = "16px";
    downloadButton.style.backgroundColor = "#007bff";
    downloadButton.style.color = "white";
    downloadButton.style.border = "none";
    downloadButton.style.borderRadius = "5px";
    downloadButton.style.cursor = "pointer";
    downloadButton.addEventListener("click", generatePDF);

    // Add the input and button to the container
    inputButtonContainer.appendChild(nameInput);
    inputButtonContainer.appendChild(downloadButton);

    // Add the container to the body
    document.body.prepend(inputButtonContainer);

    // Enable/disable the download button based on QA name input
    nameInput.addEventListener("input", function () {
        downloadButton.disabled = nameInput.value.trim() === "";
    });

    // Create the info container
    const infoContainer = document.createElement("div");
    infoContainer.id = "info-container";
    infoContainer.style.marginBottom = "20px";
    infoContainer.style.padding = "10px";
    infoContainer.style.backgroundColor = "#f9f9f9";
    infoContainer.style.border = "1px solid #ddd";
    infoContainer.style.borderRadius = "5px";
    document.body.insertBefore(infoContainer, checklistContainer);

    // Create an error message element
    const errorMessage = document.createElement("div");
    errorMessage.id = "error-message";
    errorMessage.style.color = "red";
    errorMessage.style.marginBottom = "10px";
    document.body.insertBefore(errorMessage, inputButtonContainer); // Add it before the input/button container

    // Function to fetch public IP with fallback APIs
    async function fetchPublicIP() {
        const apiUrls = [
            'https://api.ipify.org?format=json', // IPv4 by default
            'https://api4.ipify.org?format=json', // Explicitly IPv4
            'https://ipv4.seeip.org/json'         // Another IPv4 API
        ];

        for (const url of apiUrls) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                return data.ip || "Unable to fetch public IP";
            } catch (error) {
                console.error(`Error fetching public IP from ${url}:`, error);
            }
        }
        return "Unable to fetch public IP";
    }

    // Update the info container with date, time, and public IP
    async function updateInfo() {
        // Update date and time immediately
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const qaName = nameInput.value.trim() || "Not provided";

        // Display date, time, and QA name immediately
        infoContainer.innerHTML = `
            <p><strong>Date:</strong> ${currentDate} <strong>Time:</strong> ${currentTime}</p>
            <p><strong>Device/Public IP:</strong> Loading...</p>
            <p><strong>QA Name:</strong> ${qaName}</p>
        `;

        // Fetch public IP with fallback APIs
        const publicIP = await fetchPublicIP();

        // Update the info container with the public IP
        infoContainer.innerHTML = `
            <p><strong>Date:</strong> ${currentDate} <strong>Time:</strong> ${currentTime}</p>
            <p><strong>Device/Public IP:</strong> ${publicIP}</p>
            <p><strong>QA Name:</strong> ${qaName}</p>
        `;
    }

    // Update the info container whenever the QA name changes
    nameInput.addEventListener("input", updateInfo);
    updateInfo();

    // Create a progress bar container
    const progressBarContainer = document.createElement("div");
    progressBarContainer.id = "progress-bar-container";
    progressBarContainer.style.width = "100%";
    progressBarContainer.style.height = "20px";
    progressBarContainer.style.backgroundColor = "#f3f3f3";
    progressBarContainer.style.borderRadius = "10px";
    progressBarContainer.style.marginTop = "10px";
    progressBarContainer.style.position = "relative"; // Required for positioning the text
    progressBarContainer.style.overflow = "hidden"; // Ensure text doesn't overflow

    // Create the progress bar
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    progressBar.style.height = "100%";
    progressBar.style.backgroundColor = "#007bff";
    progressBar.style.borderRadius = "10px";
    progressBar.style.width = "0%";
    progressBar.style.position = "relative"; // Required for z-index

    // Create a text element for the percentage
    const progressText = document.createElement("div");
    progressText.id = "progress-text";
    progressText.style.position = "absolute";
    progressText.style.top = "50%";
    progressText.style.left = "10px"; // Left-justify the text
    progressText.style.transform = "translateY(-50%)"; // Center vertically
    progressText.style.color = "#000"; // Black text for visibility
    progressText.style.fontSize = "12px";
    progressText.style.fontWeight = "bold";
    progressText.style.zIndex = "2"; // Ensure text is above the progress bar
    progressText.textContent = "0%";

    // Append the progress bar and text to the container
    progressBarContainer.appendChild(progressBar);
    progressBarContainer.appendChild(progressText);

    // Add the progress bar container to the body
    document.body.insertBefore(progressBarContainer, checklistContainer);

    // Track completion status
    const checkboxes = {};
    const notes = {};

    function updateCompletionStatus() {
        const totalItems = Object.keys(checkboxes).length;
        let completedItems = 0;

        Object.keys(checkboxes).forEach(test => {
            if (checkboxes[test].checked) {
                completedItems++;
            }
        });

        const completionPercentage = (
            (completedItems / totalItems) * 100
        ).toFixed(2);

        progressBar.style.width = `${completionPercentage}%`;
        progressText.textContent = `${completionPercentage}%`; // Update the percentage text
    }

    // Render the checklist
    testCases.forEach(section => {
        const sectionDiv = document.createElement("div");
        sectionDiv.style.marginBottom = "20px";
        sectionDiv.style.padding = "10px";
        sectionDiv.style.backgroundColor = "#fff";
        sectionDiv.style.border = "1px solid #ddd";
        sectionDiv.style.borderRadius = "5px";

        const sectionHeader = document.createElement("h2");
        sectionHeader.textContent = section.category;
        sectionHeader.style.marginBottom = "10px";
        sectionHeader.style.color = "#333";
        sectionDiv.appendChild(sectionHeader);

        section.tests.forEach(test => {
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "space-between";
            container.style.alignItems = "center";
            container.style.marginBottom = "10px";

            const label = document.createElement("label");
            label.style.flex = "1";
            label.style.color = "#555";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkboxes[test] = checkbox;
            checkbox.addEventListener("change", updateCompletionStatus);

            const noteInput = document.createElement("input");
            noteInput.type = "text";
            noteInput.placeholder = "Add notes here";
            noteInput.style.marginLeft = "10px";
            noteInput.style.flex = "1";
            noteInput.style.padding = "5px";
            noteInput.style.border = "1px solid #ccc";
            noteInput.style.borderRadius = "5px";
            notes[test] = noteInput;
            noteInput.addEventListener("input", updateCompletionStatus);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + test));
            container.appendChild(label);
            container.appendChild(noteInput);
            sectionDiv.appendChild(container);
        });

        checklistContainer.appendChild(sectionDiv);
    });

    // Validate the checklist before generating the PDF
    function validateChecklist() {
        let isValid = true;
        Object.keys(checkboxes).forEach(test => {
            if (!checkboxes[test].checked && notes[test].value.trim() === "") {
                isValid = false;
                notes[test].style.border = "1px solid red"; // Highlight missing notes
            } else {
                notes[test].style.border = ""; // Reset border
            }
        });
        return isValid;
    }

    // Generate the PDF
    function generatePDF() {
        console.log("Generate PDF button clicked"); // Debug log

        // Validate QA Name
        const qaName = nameInput.value.trim();
        console.log("QA Name:", qaName); // Debug log

        if (!qaName) {
            console.log("QA Name is empty"); // Debug log
            errorMessage.textContent = "Please enter a QA Name before downloading the PDF.";
            return; // Stop further execution
        } else {
            errorMessage.textContent = ""; // Clear error message if QA Name is entered
        }

        // Validate checklist
        if (!validateChecklist()) {
            errorMessage.textContent = "Please add notes for failed tests before generating the PDF.";
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 15;

        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        const publicIP = infoContainer.textContent.split("Device/Public IP:")[1]?.split("QA Name:")[0].trim() || "Unable to fetch public IP";
        const completionPercentage = (
            (Object.values(checkboxes).filter(checkbox => checkbox.checked).length / 
            Object.keys(checkboxes).length) * 100
        ).toFixed(2);

        doc.setFont("helvetica");
        doc.setFontSize(10);
        doc.text(`Date: ${currentDate}    Time: ${currentTime}`, 10, y);
        y += 7;
        doc.text(`Device/Public IP: ${publicIP}`, 10, y);
        y += 7;
        doc.text(`QA Name: ${qaName}`, 10, y);
        y += 10;
        doc.text(`Completion: ${completionPercentage}%`, 10, y);
        y += 10;

        doc.setFontSize(14);
        doc.text("Store and Forward Testing Script", 10, y);
        y += 10;

        doc.setFontSize(12);
        testCases.forEach(section => {
            doc.text(section.category, 10, y);
            y += 7;
            section.tests.forEach(test => {
                const checkboxMark = checkboxes[test].checked ? "[X]" : "[ ]";
                const noteText = notes[test].value ? ` - Notes: ${notes[test].value}` : "";
                doc.text(`${checkboxMark} ${test}${noteText}`, 15, y);
                y += 6;
            });
            y += 5;
        });

        // Append date and time to the filename
        const formattedDate = currentDate.replace(/\//g, "-"); // Replace slashes with dashes
        const formattedTime = currentTime.replace(/:/g, "-"); // Replace colons with dashes
        const fileName = `EMV_Testing_Checklist_${formattedDate}_${formattedTime}.pdf`;

        doc.save(fileName); // Save the PDF with the updated filename
    }
});