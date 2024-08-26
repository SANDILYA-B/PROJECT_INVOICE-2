sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button"
], function (MessageBox, Dialog, Text, Button) {
    "use strict";
    return {
        fetch: function (oBindingContext, aSelectedContexts) {
            var messageTimer;

            var oStatusText = new Text({ text: "Initiating Billing Docs Fetch..." });

            var oDialog = new Dialog({
                title: "Fetching Data",
                content: [oStatusText],
                beginButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                        clearTimeout(messageTimer);
                    }
                })
            });

            oDialog.open();

            function updateStatus(message, endDialog = false) {
                oStatusText.setText(message);
                if (messageTimer) clearTimeout(messageTimer);

                if (endDialog) {
                    // Change button text to 'Close' and update press handler
                    oDialog.getBeginButton().setText("Close");
                    oDialog.getBeginButton().detachPress(); // Remove previous press handler
                    oDialog.getBeginButton().attachPress(function () {
                        oDialog.close(); // Close the dialog on 'Close' button click
                    });
                } else {
                    messageTimer = setTimeout(() => oStatusText.setText(""), 8000);
                }
            }

            function handleStatusResponse(response) {
                if (response && typeof response === 'object' && response.value) {
                    const messages = response.value.messages || [];
                    const totalRecords = response.value.totalRecords || 0; // Assuming `totalRecords` is part of the response
                    updateStatus(`Records Count: ${totalRecords}`);

                    messages.forEach((msg, i) => {
                        setTimeout(() => {
                            if (msg === "Billing data fetch completed successfully") {
                                updateStatus(msg, true);
                            } else {
                                updateStatus(msg);
                            }
                        }, i * 4000);
                    });
                } else {
                    updateStatus("Unexpected format of status response.", true);
                }
            }

            $.ajax({
                url: "/odata/v4/satinfotech/BillingFetch",
                type: "POST",
                contentType: "application/json",
                success: function () {
                    // Poll only once after 6 seconds
                    setTimeout(() => {
                        $.ajax({
                            url: "/odata/v4/satinfotech/Status",
                            type: "POST",
                            contentType: "application/json",
                            success: handleStatusResponse,
                            error: function () {
                                updateStatus("Polling error occurred.", true);
                            }
                        });
                    }, 6000);
                },
                error: function () {
                    updateStatus("Error initiating fetch operation.", true);
                }
            });
        }
    };
});