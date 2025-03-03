import React, { useEffect, useState } from "react";
import LeftNavBar from "../components/LeftNavBar";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Select from "react-select";
import { Snackbar, Alert } from "@mui/material";
import { updatePermissions, sendEmailNotification, fetchLinks, fetchUsersBySessionLink } from '../ServerApi/server';

export default function Links() {
    const navigate = useNavigate();
    const [links, setLinks] = useState([]);
    const [error, setError] = useState(null);
    const [isPermissionRequested, setIsPermissionRequested] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Logout function
    const logoutOption = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        Cookies.remove("access_token");
        navigate("/");
    };

    // Fetch links and users data from API
    useEffect(() => {
        const fetchLinksAndUsers = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) throw new Error("User not found. Please log in again.");

                const linksData = await fetchLinks(userId);



                if (linksData.length === 0) {
                    setLinks([]); // Set an empty list if no links are found
                    return;
                }

                const linksWithPermissions = linksData.map((link) => ({
                    session_link_id: link.session_link_id,
                    session_link: link.session_link,
                    created_at: link.created_at,
                    user_name: link.user_name,
                    requestPermission: false,
                }));

                setLinks(linksWithPermissions);

                // Use global function to fetch users
                linksWithPermissions.forEach((link, index) =>
                    fetchUsersForLink(link.session_link_id, index)
                );
            } catch (err) {
                console.error("Error fetching links:", err);
                setError(err.message || "Failed to fetch links");
            }
        };

        fetchLinksAndUsers();
    }, []);


    // Global fetchUsersForLink function
    const fetchUsersForLink = async (sessionLinkId, index) => {
        if (!sessionLinkId) {
            console.error("SessionLinkId is undefined.");
            return;
        }

        try {
            const userId = localStorage.getItem("userId");
            if (!userId) throw new Error("User not found. Please log in again.");

            const { users_with_permission, users_without_permission } = await fetchUsersBySessionLink(sessionLinkId, userId);
            const options = [
                {
                    label: "Users with Permission",
                    options: users_with_permission.map((user) => ({
                        value: user.id,
                        label: `${user.name} - Permission Granted`,
                        email: user.email, // Include email
                        isDisabled: true,
                    })),
                },
                {
                    label: "Users without Permission",
                    options: users_without_permission.map((user) => ({
                        value: user.id,
                        label: `${user.name} - No Permissions`,
                        email: user.email, // Include email
                        isDisabled: false,
                    })),
                },
            ];

            // Update the specific link with fetched users
            setLinks((prevLinks) =>
                prevLinks.map((link, i) =>
                    i === index ? { ...link, userOptions: options } : link
                )
            );
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    // Handle user selection
    const handleUserSelection = (selectedOptions, index) => {
        const updatedLinks = links.map((link, i) =>
            i === index
                ? { ...link, selectedUsers: selectedOptions } // Update selected users for this row
                : link
        );

        setLinks(updatedLinks);
    };



    const toggleRequestPermission = (index) => {
        const updatedLinks = links.map((link, i) => ({
            ...link,
            requestPermission: i === index ? !link.requestPermission : link.requestPermission,
        }));

        setLinks(updatedLinks);

        // Enable/disable the Submit button based on the checkbox state
        const permissionRequested = updatedLinks[index].requestPermission;
        setIsPermissionRequested(permissionRequested);
    };
    const handlePermissionUpdate = async (index) => {
        const selectedLink = links[index];

        // Ensure there's at least one user selected for permission update
        if (!selectedLink || !selectedLink.selectedUsers || selectedLink.selectedUsers.length === 0) {
            setSnackbarMessage("Please select at least one user to update permission.");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
            return;
        }

        try {
            // Prepare the payload for the permission update
            const payload = {
                session_link: selectedLink.session_link,
                permissions: selectedLink.selectedUsers.reduce((acc, user) => {
                    acc[user.value] = true; // Mark selected users as having permissions
                    return acc;
                }, {}),
            };

            // Call the API to update permissions
            await updatePermissions(payload);

            setSnackbarMessage("Permission Sent successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            // Send emails to users with updated permissions
            const emailPromises = selectedLink.selectedUsers.map((user) => {
                return sendEmailNotification(user.email, selectedLink.session_link, user.label.split(" - ")[0]);
            });

            // Wait for all emails to be sent before proceeding
            await Promise.all(emailPromises);

            // Update dropdown options locally
            setLinks((prevLinks) =>
                prevLinks.map((link, i) => {
                    if (i !== index) return link; // Only update the modified link

                    const { userOptions, selectedUsers } = link;

                    const usersWithPermission = userOptions[0]?.options || []; // Users with permission
                    const usersWithoutPermission = userOptions[1]?.options || []; // Users without permission

                    // Move selected users from "without permission" to "with permission"
                    const newUsersWithPermission = [
                        ...usersWithPermission,
                        ...selectedUsers.map((user) => ({
                            value: user.value,
                            label: `${user.label.split(" - ")[0]} - Permission Granted`,

                        })),
                    ];

                    const newUsersWithoutPermission = usersWithoutPermission.filter(
                        (user) => !selectedUsers.some((selected) => selected.value === user.value)
                    );

                    // Return the updated link
                    return {
                        ...link,
                        userOptions: [
                            { label: "Users with Permission", options: newUsersWithPermission },
                            { label: "Users without Permission", options: newUsersWithoutPermission },
                        ],
                        selectedUsers: [], // Clear selected users after update
                    };
                })
            );
        } catch (err) {
            console.error("Error updating permissions or sending emails:", err);
            setSnackbarMessage("Failed to update permissions or send emails.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };


    if (error) {
        return (
            <div>
                <h4>Error: {error}</h4>
                <button onClick={logoutOption}>Logout</button>
            </div>
        );
    }

    return (
        <div>
            <div className="g-sidenav-show bg-gray-200" style={{ height: "100vh" }}>
                <LeftNavBar />
                <div className="main-content position-relative max-height-vh-800 h-100 border-radius-lg ml-72">
                    <nav className="w-full min-h-[40px] flex justify-between items-center p-2 bg-[#e3ccac25] sticky top-0 backdrop-blur-[3px] z-[99]">
                        <div className="container-fluid py-1 px-3">
                            <h6 className="font-weight-bolder mb-0 underline underline-offset-8">Links</h6>
                        </div>
                        <div className="cursor-pointer bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out w-[120px] text-white rounded-md text-center">
                            <h6
                                className="font-weight-bolder mb-0 text-white rounded-md"
                                onClick={logoutOption}
                                style={{ padding: "10px", cursor: "pointer" }}
                            >
                                Logout
                            </h6>
                        </div>
                    </nav>
                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-12">
                                <div className="card my-4">
                                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                        <div
                                            className="shadow-primary border-radius-lg pt-4 pb-3 bg-gradient-to-b from-[#4d1d95ac] via-[#3830a3c5] to-[#312e81d3]"
                                        >
                                            <h6 className="text-white text-capitalize ps-3">User Links</h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        <div className="table-responsive p-0">
                                            <table className="table align-items-center mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Session Link</th>
                                                        <th>Users Permission</th>
                                                        <th>Request Permission</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {links.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: "center" }}>
                                                                No links available
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        links.map((link, index) => (
                                                            <tr key={index}>
                                                                <td>{link.user_name}</td>
                                                                <td>
                                                                    <a
                                                                        href={link.session_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {link.isExpanded
                                                                            ? link.session_link
                                                                            : `${link.session_link.substring(0, 30)}...`}
                                                                    </a>
                                                                    <button
                                                                        onClick={() => {
                                                                            setLinks((prevLinks) =>
                                                                                prevLinks.map((l, i) =>
                                                                                    i === index
                                                                                        ? { ...l, isExpanded: !l.isExpanded }
                                                                                        : l
                                                                                )
                                                                            );
                                                                        }}
                                                                        style={{
                                                                            background: "none",
                                                                            border: "none",
                                                                            color: "blue",
                                                                            cursor: "pointer",
                                                                            textDecoration: "underline",
                                                                        }}
                                                                    >
                                                                        {link.isExpanded ? "Show less" : "Show more"}
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <Select
                                                                        options={link.userOptions || []}
                                                                        isMulti
                                                                        placeholder="Select users"
                                                                        onChange={(selectedOptions) =>
                                                                            handleUserSelection(selectedOptions, index)
                                                                        }
                                                                        value={link.selectedUsers || []}
                                                                        isClearable
                                                                        className="user-dropdown"
                                                                        isDisabled={isPermissionRequested} // Disable if checkbox is checked
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`request-${index}`}
                                                                            checked={link.requestPermission}
                                                                            onChange={() => toggleRequestPermission(index)}
                                                                        />
                                                                        <label htmlFor={`request-${index}`}>
                                                                            Request Permission
                                                                        </label>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handlePermissionUpdate(index)}
                                                                        style={{
                                                                            color: "white",
                                                                            border: "none",
                                                                            borderRadius: "5px",
                                                                            padding: "5px 10px",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        className="bg-[#541f8b] hover:bg-[#6b2aa9] transition-all duration-150 ease-in-out"
                                                                        disabled={!isPermissionRequested} // Enable only if checkbox is checked
                                                                    >
                                                                        Submit
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};
