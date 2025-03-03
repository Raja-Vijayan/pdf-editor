import React from "react";

export default function SuccessPopup({ popupMessage }) {
    return (
        <div className="popup">
            <div className="popup-content">
                <p>{popupMessage}</p>
            </div>
        </div>
    )
}
