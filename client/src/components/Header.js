import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import _ from 'lodash';
import { Link, useNavigate } from 'react-router-dom';
import LoGoImage from '../Login/Images/logo.png';
import { IoMdPrint } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AiOutlineLogout } from "react-icons/ai";
import { FaCloudDownloadAlt, FaPlus } from "react-icons/fa";
import { BiRedo, BiUndo } from "react-icons/bi";

import { createTemporaryYearbookAPI } from '../ServerApi/server';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import { generateSessionLink, fetchUsers, updatePermissionsAPI, sendEmailAPI } from '../ServerApi/server';
import Snackbar from '@mui/material/Snackbar';
import ReactSelect from 'react-select';
import Alert from "@mui/material/Alert";
import CustomFonts from '../helper/CustomFonts';

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="down" ref={ref} {...props} />;
});

export default function Header({ setSaveStatus, preventKey, status, pdfId, addNewPage }) {
    const navigate = useNavigate();
    const [popupOpen, setPopupOpen] = useState(false);
    const [sessionLink, setSessionLink] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [permissions, setPermissions] = useState({});
    const isSaveEnabled = Object.values(permissions).some(value => value === true);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        const fetchAndSetUsers = async () => {
            try {
                const userData = await fetchUsers();
                setUsers(userData);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchAndSetUsers();
    }, []);

    const printImage = async () => {
        const sections = document.querySelectorAll('.frameBleed');
        const pdfContainer = document.createElement('div');
    
        const classesToKeep = ['frameBleed', 'flex', 'relative', 'items-center', 'justify-center', 'frameBox-1'];
    
        for (const section of sections) {
            const clonedSection = section.cloneNode(true);
    
            // Keep only selected classes
            const filteredClasses = clonedSection.className
                .split(' ')
                .filter(className => classesToKeep.includes(className))
                .join(' ');
    
            clonedSection.className = filteredClasses;
    
            // Reset unwanted styles
            clonedSection.style.border = 'none';
            clonedSection.style.backgroundColor = 'white';
    
            clonedSection.querySelectorAll('*').forEach(item => {
                item.style.border = 'none';
                item.style.display = '';
            });
    
            pdfContainer.appendChild(clonedSection);
        }
    
        document.body.appendChild(pdfContainer);
    
        if (pdfContainer) {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [450, 575],
            });

            Object.keys(CustomFonts).forEach((fontName)=>{
                pdf.addFileToVFS(`${fontName}.ttf`,CustomFonts[fontName]);
                pdf.addFont(`${fontName}.ttf`,fontName, "normal");
            })
            
    
            // **Detect font from the first `.frameBleed` element**
        let detectedFont = "helvetica"; // Default font
        if (sections.length > 0) {
            const computedFont = window.getComputedStyle(sections[0]).fontFamily;
            
            // Extract the first available font
            const fontCandidates = computedFont.split(',').map(font => font.trim().replace(/["']/g, '')); // Remove quotes
            
            // Find a matching font in CustomFonts
            detectedFont = fontCandidates.find(font => CustomFonts[font]) || "helvetica"; // Fallback to Helvetica
        }

        pdf.setFont(detectedFont); // Set detected font
        pdf.setFontSize(14); // Set font size
    
            pdf.html(pdfContainer, {
                x: 0,
                y: 0,
                callback: function (doc) {
                    
                    doc.save('yearbook_with_html_behavior.pdf');
                },
            });
        }
    
        document.body.removeChild(pdfContainer);
    };
    
    
        
   const handleOrderAndPrint = async () => {
        const sections = document.querySelectorAll('.previewArea');
        const pageCount = sections.length;

        if (pageCount && pageCount > 0) {
            const userId = localStorage.getItem('userId');

            const firstSection = sections[0];
            const thumbnailCanvas = await html2canvas(firstSection, { scale: 2 });
            const thumbnailBlob = await new Promise((resolve) => thumbnailCanvas.toBlob(resolve, 'image/png'));

            const pdfBlob = await printImage();

            try {
                const createdYearbook = await createTemporaryYearbookAPI(userId, thumbnailBlob, pdfBlob);
                const tempYearbookId = createdYearbook.id;

                navigate('/Addcarts', { state: { pageCount, yearbook_front_page: thumbnailBlob, tempYearbookId } });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert("Page count is required to add to cart.");
        }
    };

    const handleShareClick = async () => {
        if (!localStorage.getItem('userId') || !localStorage.getItem('email')) {
            alert('User ID and email are required to generate a session link.');
            return;
        }

        setLoading(true);
        try {
            const generatedLink = await generateSessionLink(
                localStorage.getItem('userId'),
                localStorage.getItem('email'),
                pdfId
            );

            localStorage.setItem('sessionLink', generatedLink);

            setSessionLink(generatedLink);
            setPopupOpen(true);
        } catch (error) {
            console.error('Error generating session link:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (userId, canAccess) => {
        setPermissions(prev => ({ ...prev, [userId]: canAccess }));
    };

    const handleClose = (showSnackbar = false, message = "", severity = "info") => {
        setPopupOpen(false);

        if (showSnackbar) {
            setSnackbarMessage(message);
            setSnackbarSeverity(severity);
            setSnackbarOpen(true);
        }
    };

    const updatePermissions = async () => {
        try {
            const sessionLink = localStorage.getItem("sessionLink");
            if (!sessionLink) {
                handleClose(true, "Session link is missing.", "warning");
                return;
            }

            const result = await updatePermissionsAPI(sessionLink, permissions);

            if (result.status === "success") {

            } else {
                handleClose(true, "Failed to update permissions. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error updating permissions:", error);
            handleClose(true, "An error occurred while updating permissions.", "error");
        }
    };
    const sendEmail = async () => {
        try {
            if (!sessionLink) {
                handleClose(true, "Session link is missing.", "error");
                return;
            }

            if (selectedUsers.length === 0) {
                handleClose(true, "Please select at least one user.", "warning");
                return;
            }

            setLoading(true);

            for (const userId of selectedUsers) {
                const user = users.find((user) => user.id === userId);
                if (!user) continue;

                const result = await sendEmailAPI(user.email, sessionLink, user.name);

                if (result.status !== "success") {
                    throw new Error(`Failed to send email to ${user.email}`);
                }
            }

            handleClose(true, "Emails sent successfully.", "success");
        } catch (error) {
            console.error("Error sending emails:", error);
            handleClose(true, "Error sending emails. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed h-[60px] px-3 py-1 w-full z-50 bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900' >
            <div className='absolute left-0 top-0 w-[150px] h-[120%] bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900 flex justify-center items-center cursor-pointer' style={{ borderBottomRightRadius: '10px', borderRight: '2px solid white', borderBottom: '2px solid white' }} >
                <img src={LoGoImage} className='aspect-square w-[100px] h-[50px] -mt-[4px]' alt='pixel-logo' />
            </div>
            <div className='absolute left-[180px] top-0 h-full flex justify-center items-center gap-3'>
                <div className='autosave-icon-container flex gap-[4px] px-1'>
                    <Tippy content={<span className='text-[12px]'>undo</span>}>
                        <button onClick={() => preventKey(`undo${Date.now()}`)} disabled={(status && status?.key === 'undo' && status.status || status && status.key === "disable") ? true : false}>
                            <BiUndo className={`${(status && status?.key === 'undo' && status.status || status && status.key === "disable") ? 'text-gray-400' : 'text-white'}  text-[32px] p-1 rounded-sm cursor-pointer bg-[rgba(0,0,0,0.1)]`} />
                        </button>
                    </Tippy>
                    <Tippy content={<span className='text-[12px]'>redo</span>}>
                        <button onClick={() => preventKey(`redo${Date.now()}`)} disabled={(status && status?.key === 'redo' && status.status || status && status.key === "disable") ? true : false}>
                            <BiRedo className={`${(status && status?.key === 'redo' && status.status || status && status.key === "disable") ? 'text-gray-400' : 'text-white'}  text-[32px] p-1 rounded-sm cursor-pointer bg-[rgba(0,0,0,0.1)]`} />
                        </button>
                    </Tippy>
                </div>
            </div>
            <div className='flex justify-between items-center text-gray-300 h-full'>
                <Link to='/design/edit'>
                    {/* <img src={LoGoImage} className='aspect-square w-[100px] h-[50px] -mt-[4px]' alt='pixel-logo' /> */}
                </Link>
                <div className='flex gap-2'>
                    <div className='flex justify-center items-center gap-2 text-gray-300'>
                        <Tippy content={<span className='text-[12px]'>Order & Print</span>}>
                            <button onClick={printImage} className='px-3 py-[6px] outline-none bg-transparent text-white font-[500] rounded-sm flex gap-1 items-center text-[15px]' style={{ border: '1px solid rgba(255,255,255,0.3)' }}>Order & Print <IoMdPrint className='text-[16px]' /></button>
                        </Tippy>
                    </div>
                    <div className='flex justify-center items-center gap-2 relative group'>
                        <Tippy content={<span className='text-[12px]'>Add Page</span>}>
                            <button className='px-3 py-[6px] outline-none bg-white rounded-md text-[#333] font-[500] flex gap-1 items-center text-[15px]' style={{ border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => addNewPage()}>
                                <FaPlus className='text-[18px] rounded-md text-[rgba(0,0,0,0.7)]' />
                                Add Page
                            </button>
                        </Tippy>
                        <Tippy content={<span className='text-[12px]'>Save your work</span>}>
                            <button className='px-3 py-[6px] outline-none bg-white rounded-md text-[#333] font-[500] flex gap-1 items-center text-[15px]' style={{ border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => setSaveStatus()}>
                                <FaCloudDownloadAlt className='text-[20px] rounded-md' id='autosave-icon' />
                                Save your work
                            </button>
                        </Tippy>
                        <Tippy content={<span className='text-[12px]'>Share your work</span>}>
                            <button onClick={handleShareClick} className='px-3 py-[6px] outline-none bg-white rounded-md text-[#333] font-[500] flex gap-1 items-center text-[15px]' style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
                                <MdOutlineFileUpload className='text-[16px]' />
                                Share
                            </button>
                        </Tippy>
                        <Tippy content={<span className='text-[12px]'>Logout</span>}>
                            <button className='px-3 py-[6px] outline-none bg-white rounded-md text-[#333] font-[500] flex gap-1 items-center text-[15px]' style={{ border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => { localStorage.removeItem('userId'); localStorage.removeItem('role'); navigate('/') }} >
                                <AiOutlineLogout className='text-[16px]' />
                                Logout
                            </button>
                        </Tippy>
                    </div>
                </div>
            </div>
            <Dialog open={popupOpen} TransitionComponent={Transition} keepMounted onClose={handleClose}>
                <DialogTitle>Shareable Link</DialogTitle>
                <DialogContent>
                    {/* Shareable link section */}
                    <p>Here is your shareable link:</p>
                    <div
                        style={{
                            wordBreak: 'break-all',
                            margin: '10px 0',
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                        }}
                    >
                        <a href={sessionLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                            {sessionLink}
                        </a>
                    </div>

                    {/* User selection and permissions */}
                    <div style={{ marginTop: '20px' }}>
                        <p>Assign permissions to users:</p>
                        <ReactSelect
                            isMulti
                            options={users.map(user => ({ value: user.id, label: user.name }))}
                            onChange={selectedOptions => setSelectedUsers(selectedOptions.map(option => option.value))}
                        />
                        <div style={{ marginTop: '10px' }}>
                            {selectedUsers.map(userId => (
                                <div key={userId} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={permissions[userId] || false}
                                            style={{ marginRight: '8px' }}
                                            onChange={e => handlePermissionChange(userId, e.target.checked)}
                                        />
                                        Allow Access for {users.find(user => user.id === userId)?.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={updatePermissions} color="primary" disabled={!isSaveEnabled}>
                        Sent Permissions
                    </Button>
                    <Button onClick={sendEmail} disabled={loading}>
                        {loading ? "Sending..." : "Send Email"}
                    </Button>

                    <Button onClick={handleClose} color="default">Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
};