import React from "react"

export default function RefusedPopup({ popupRefusedMessage }) {
    return (
        <div className="popup-refused">
            <div className="popup-content-refused">
                <p>{popupRefusedMessage}</p>
            </div>
        </div>
    )
}