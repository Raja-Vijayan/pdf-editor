import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import Header from '../components/Header';
import TemplateDesign from '../components/main/TemplateDesign';
import MyImages from '../components/MyImages';
import Image from '../components/Image';
import CreateComponent from '../components/CreateComponent';
import Draw from '../components/Draw';
import { generateRandom4DigitNumber } from '../helper/Helpers';
import { GetImages } from '../ServerApi/server';
import { TbBackground } from "react-icons/tb";
import { CiSettings } from "react-icons/ci";
import { FaItalic, FaSyncAlt, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';
import { RxTransparencyGrid } from "react-icons/rx";
import { MdOutlineFormatAlignCenter, MdVerticalAlignTop, MdOutlineVerticalAlignCenter, MdVerticalAlignBottom, MdContrast, MdOutlineGradient, MdInvertColors, MdPhotoFilter, MdBrightnessMedium, MdBlurLinear } from "react-icons/md";
import Background from '../components/Background';
import Pdf from '../components/Pdf';
import { PlaceHolder } from '../helper/PlaceHolder';
import Elements from '../components/Elements';
import html2canvas from 'html2canvas';
import { saveEditedHTML } from '../ServerApi/server';
import BackgroundImage from "../assets/img/stripe.jpg";
import Snackbar from '@mui/material/Snackbar';
import Alert from "@mui/material/Alert";
import { getSessionData } from '../ServerApi/server';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { CiFilter } from "react-icons/ci";

Modal.setAppElement('#root');

export default function Main() {

    const initialEditOptions = {
        width: 0,
        height: 0,
        rotate: 0,
        opacity: 1,
        fontSize: 0,
        fontFamily: '',
        color: '',
        backgroundColor: '',
        bold: false,
        italic: false,
        underline: false,
        left: false,
        middle: false,
        right: false,
        top: false,
        bottom: false,
        middleVertical: false,
        blur: 1,
        brightness: 100,
        contrast: 0,
        grayscale: 0,
        invert: 0,
        sepia: 0
    };
    const frameCoordinates = {
        bleedAreaX: 450,
        bleedAreaY: 575,
        pageSizeX: 425,
        pageSizeY: 550,
        contentAreaX: 375,
        contentAreaY: 500,
    };

    const [currentComponent, setCurrentComponent] = useState('');
    const [popupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();
    const [state, setState] = useState('design');
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const [selectedElement, _setSelectedElement] = useState(null);
    const [drawState, setDrawState] = useState();
    const [isSectionActivated, setIsSectionActivated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [preventStatus, setPreventStatus] = useState('');
    const [undoRedoStatus, setUndoRedoStatus] = useState({});
    const [isElementAdded, setIsElementAdded] = useState(0);
    const [JSX, setJSX] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [isElementUpdated,] = useState(1);
    const [isDrawActivated, setIsDrawActivated] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const existingEditId = localStorage.getItem('editId');
    const createComponentRef = useRef(null);
    const [dragData, setDragData] = useState();
    const colorPickerRef = useRef(null);
    const [pdfPages, setPdfPages] = useState(null);
    const [pdfId, setPdfId] = useState(0);
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfCategory, setPdfCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageRefs = useRef([]);
    const containerRef = useRef(null);
    const [editOptions, setEditOptions] = useState(initialEditOptions);
    const [show, setShow] = useState({ status: true, name: '' });
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [pngImages, setPngImages] = useState([]);
    const [elementImages, setElementImages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isRangeVisible, setIsRangeVisible] = useState(false);
    const [isTransparencyVisible, setIsTransparencyVisible] = useState(false);
    const [isAlignmentVisible, setIsAlignmentVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [isEditorActive, setIsEditorActive] = useState(false);
    const [settings, setSettings] = useState({
        applyEditingRuler: JSON.parse(sessionStorage.getItem('settings'))?.applyEditingRuler || false, // Default value for the checkbox
    });

    const fetchImages = async (imageType) => {
        try {
            const getImagesApiResponse = await GetImages(imageType, null);
            if (getImagesApiResponse.status === 200) {
                if (imageType === 'background') {
                    setBackgroundImages(getImagesApiResponse.data.design_assets);
                } else if (imageType === 'png') {
                    setPngImages(getImagesApiResponse.data.design_assets);
                } else if (imageType === 'svg') {
                    setElementImages(getImagesApiResponse.data.design_assets);
                }
                setIsLoaded(true);
            }
        } catch (error) {
            console.log('Error while fetch the images -->', error.message);
        }
    };

    const setElements = async (name, imageType) => {
        if (imageType !== null) {
            fetchImages(imageType);
        }
        setShow({
            state: false,
            name
        });

        sessionStorage.removeItem('currentPreview');
        setIsSectionActivated(!isSectionActivated);
    };

    const componentStyle = [{
        name: 'main_frame',
        type: 'rect',
        id: generateRandom4DigitNumber(),
        pageCount: 0,
        height: 480,
        width: 240,
        z_index: 1,
        color: '#fff',
    }];

    const [components, setComponents] = useState([...componentStyle]);

    const newComponent = () => {
        const countMainFrames = components.filter(component => component.name === 'main_frame').length;
        const style = {
            name: 'main_frame',
            type: 'rect',
            id: generateRandom4DigitNumber(),
            pageCount: countMainFrames,
            height: 480,
            width: 240,
            z_index: 1,
            color: '#fff',
        }
        setComponents(prevState => ([...prevState, style]));
        const interval = setInterval(() => {
            const rulerContainer = document.querySelector('.rulerContainer');
            if (rulerContainer) {
                let scriptText = ``;
                const selector = `.rulerContainer`;
                scriptText += `jquery('${selector}').ruler();`;

                if (scriptText) {
                    const script = document.createElement('script');
                    script.id = 'jquery-ruler-script';
                    script.type = 'text/javascript';
                    script.text = scriptText;
                    document.body.appendChild(script);
                }
                clearInterval(interval);
            }
        }, 100);
    }

    const showPdfUrl = (pdf) => {
        setPdfPages(pdf.pages);
        setPdfId(pdf.id);
        setPdfTitle(pdf.title_name);
        setPdfCategory(pdf.pdfType);
    };


    useEffect(() => {
        const fullUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const sessionLinkFromUrl = urlParams.get("session_link");
        const userId = localStorage.getItem("userId");

        if (sessionLinkFromUrl) {
            sessionStorage.setItem("sessionLink", fullUrl);
        }

        const sessionLink = sessionStorage.getItem("sessionLink");

        if (sessionLink && userId) {
            const fetchSessionData = async () => {
                try {
                    const data = await getSessionData(sessionLink, userId);
                    setPdfPages(decodeURIComponent(data.pdfPages));
                    setPdfId(data.pdfId);
                    setIsPageLoaded(true);
                } catch (error) {
                    if (error.response?.status === 403) {
                        setPopupOpen(true);
                    } else if (error.response?.status === 404) {
                        alert("Session not found.");
                    } else {
                        console.error("Error fetching session data:", error);
                        setPopupOpen(true);
                    }
                }
            };

            fetchSessionData();
            sessionStorage.removeItem('sessionLink')
        }
    }, []);

    const handleDialogClose = () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('role')
        navigate('/')
    };

    const getElementStyles = (data = {}) => {
        if (Object.keys(data).length) {
            setEditOptions(data);
        }
    };

    const setSelectedElement = (element) => {
        _setSelectedElement(element);
    };

    const storeDrawData = (data) => {
        setDrawState(data);
    }

    const reset = () => {
        sessionStorage.removeItem('currentPreview');
        setElements('design');
        setState('design');
        setIsSectionActivated(!isSectionActivated);
    }

    const handleDragStart = (type, base64) => {
        console.log("Drag Start")
        setDragData({
            "type": type,
            "base64": base64,
        });

    }
    const handleDragEnd = (e) => {
        console.log("Drag End")
        const { clientX, clientY } = e;

        const pages = document.querySelectorAll('.pdfPage');
        console.log("Pages :",pages)
        let droppedOnPage = null;

        pages.forEach((page) => {
            const rect = page.getBoundingClientRect();

            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                droppedOnPage = page;
            }
        });

        if (droppedOnPage) {
            console.log("Dropped On Page Text :",droppedOnPage)
            const pageRect = droppedOnPage.getBoundingClientRect();
            const relativeX = clientX - pageRect.left;
            const relativeY = clientY - pageRect.top;

            setAddElement(dragData.type, dragData.base64, relativeX, relativeY, droppedOnPage);
        }

        setDragData(null);
    }

    const setAddElement = (selector = "", element, clientX, clientY, targetPage = null) => {
        if (!element) return;

        const page = targetPage || document.querySelectorAll('.previewArea')?.[currentPage - 1];
        if (!page) return;

        const dropX = clientX;
        const dropY = clientY;

        const createElementWithStyles = (tagName, styles = {}, attributes = {}) => {
            const elem = document.createElement(tagName);
            Object.assign(elem.style, styles);
            Object.keys(attributes).forEach(attr => elem.setAttribute(attr, attributes[attr]));
            return elem;
        };

        const appendBoxWithContent = (contentElement, boxStyles = {}) => {
            const boxElement = createElementWithStyles('div', {
                position: 'absolute',
                top: `${dropY}px`,
                left: `${dropX}px`,
                ...boxStyles,
            });
            boxElement.classList.add('box');
            if (selector === 'frame') {
                boxElement.classList.add('frame-container');
            }
            boxElement.appendChild(contentElement);
            page.appendChild(boxElement);
        };
        console.log("Selector :",selector)
        switch (selector) {
            
            case "text": {
                const newText = createElementWithStyles(
                    element,
                    {
                        position: 'absolute',
                        top: `${dropY}px`,
                        left: `${dropX}px`,
                        border: '2px solid transparent'
                    }
                );
                newText.innerHTML = "Click to edit...";
                page.appendChild(newText);
                break;
            }

            case "image": {
                if (selectedElement && selectedElement.className.includes('frame-container')) {
                    const imgElement = selectedElement.querySelector('img');
                    if (imgElement) {
                        imgElement.src = element;
                    }
                } else {
                    const imgElement = createElementWithStyles(
                        'img',
                        {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: '0',
                            left: '0',
                            pointerEvents: 'none',
                        },
                        { src: element }
                    );
                    appendBoxWithContent(imgElement, { width: '100px', height: '100px' });
                }
                break;
            }

            case "svg": {
                const svgContainer = createElementWithStyles(
                    'div',
                    { pointerEvents: 'none' }
                );
                svgContainer.classList.add('svgContainer');
                svgContainer.innerHTML = atob(element);
                appendBoxWithContent(svgContainer);
                break;
            }

            case "frame": {
                const frameStyles = { width: '100px', height: '100px' };
                const imgStyles = {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none',
                };

                const imgElement = createElementWithStyles(
                    'img',
                    imgStyles,
                    { src: BackgroundImage }
                );

                if (element === 'box-corner') {
                    imgElement.style.borderRadius = '8px';
                } else if (element !== 'box-default') {
                    imgElement.style.clipPath = element;
                }

                appendBoxWithContent(imgElement, frameStyles);
                break;
            }

            default:
                console.warn("Unknown selector:", selector);
                break;
        }

        setIsElementAdded(isElementAdded + 1);
    };

    const handlePDFElementDelete = () => {
        const focusedElement = document.querySelectorAll('[data-id="true"]');
        if (focusedElement?.length) {
            _.forEach(focusedElement, item => {
                item.remove();
            });
            setCurrentComponent('');
        }
    };

    const startResizing = (resizeEvent, direction, targetElement) => {
        let startX = resizeEvent.clientX;
        let startY = resizeEvent.clientY;
        const startWidth = parseInt(window.getComputedStyle(targetElement).width, 10);
        const startHeight = parseInt(window.getComputedStyle(targetElement).height, 10);

        const onMouseMove = (moveEvent) => {
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('right') || direction.includes('left')) {
                const offsetX = moveEvent.clientX - startX;
                newWidth = direction.includes('right') ? startWidth + offsetX : startWidth - offsetX;
            }

            if (direction.includes('bottom') || direction.includes('top')) {
                const offsetY = moveEvent.clientY - startY;
                newHeight = direction.includes('bottom') ? startHeight + offsetY : startHeight - offsetY;
            }

            // Apply new dimensions with a minimum size check
            if (newWidth > 20) targetElement.style.width = `${newWidth}px`;
            if (newHeight > 20) targetElement.style.height = `${newHeight}px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const createResizeHandlers = async (element) => {
        await removeResizeHandlers();
        const directions = ['bottom-right'];
        setIsEditorActive(true);

        directions.forEach((direction) => {
            const handler = document.createElement('div');
            handler.className = `resize-handler ${direction}-resize`;
            handler.setAttribute('contentEditable', false);
            Object.assign(handler.style, {
                position: 'absolute',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'rgb(139 61 255)',
                cursor: `${direction}-resize`,
                zIndex: '10',
            });

            // Direction-specific styling
            if (direction === 'bottom-right') {
                Object.assign(handler.style, {
                    bottom: '-6px',
                    right: '-6px',
                });
            }

            handler.addEventListener('mousedown', (resizeEvent) => {
                resizeEvent.stopPropagation();
                startResizing(resizeEvent, direction, element);
            });

            element.appendChild(handler);
        });
    };

    const removeResizeHandlers = async () => {
        document.querySelectorAll('[data-temp="true"]').forEach(item => {
            item.style.border = 'none';
        });

        document.querySelectorAll('.resize-handler').forEach(handler => {
            handler.remove();
        });
        setIsEditorActive(false);
    };

    let currentElement = null;
    let isDragging = false;
    let isClicked = false;
    let isElementActive = false;
    let clickOffset = { x: 0, y: 0 };

    const handlePdfPageController = (e) => {
        if (isDrawActivated) return;

        const element = e.target;
        const RootElement = document.getElementById('pdfContainer');

        // Ignore interaction for specific elements
        const ignoredClassesOrIds = [
            'previewArea', 'resize', 'svgContainer', 'stage', 'gsw', 'frameBleed', 'FramePage', 'pbp',
            'pf', 'page', 'vector', 'cml', 'cmr', 'cbd'
        ];
        if (
            ignoredClassesOrIds.some(cls => element.className.includes(cls) || element.id.includes(cls)) ||
            ['IMG', 'CANVAS'].includes(element.tagName)
        ) {
            return;
        }

        if (e.type === 'mouseover' && !isElementActive) {
            element.style.border = `2px solid rgb(139 61 255)`;
            element.setAttribute('data-temp', true);
            element.style.textAlign = '';

            document.querySelectorAll('.box').forEach(box => box.classList.remove('box'));
        }

        if (e.type === "click" && !isElementActive) {

            resetEditableElements(RootElement);

            document.querySelectorAll('[data-id="true"]').forEach(el => {
                el.style.border = 'none';
                el.removeAttribute('data-id');
            });

            createResizeHandlers(element);

            isClicked = true;
            element.style.cssText += `
                outline: none;
                border-radius: 5px;
                padding: 5px;
                border: 2px solid rgb(139 61 255);
            `;
            element.setAttribute('data-id', true);
            setCurrentComponent(true);
            setSelectedElement(element);

            applyElementStyles(element);

            if (isTextElement(element)) {
                element.contentEditable = "true";
                element.spellcheck = false;
                element.style.cursor = "text";
                if (element.innerText.trim() !== "") {
                    element.focus();
                }
            }
        } else if (e.type === "click") {
            element.style.border = 'none';
        }

        if (e.type === 'mouseout') {
            if (!isClicked) {
                if (element.hasAttribute('data-id')) {
                    setCurrentComponent('');
                }
            } else {
                isClicked = false;
            }
            if (!element.hasAttribute('data-id')) {
                element.style.border = 'none';
            }
            element.style.cssText += `
                padding: 0;
                border-radius: 0;
            `;
        }

        if (e.type === 'mousedown') {
            e.preventDefault();
            isDragging = true;
            isElementActive = true;
            currentElement = element;
            element.style.cursor = 'grab';

            const rect = element.getBoundingClientRect();
            clickOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }

        if (e.type === 'mouseup') {
            currentElement = null;
            isDragging = false;
            isElementActive = false;
            element.style.cursor = 'default';
            IsElementUpdated();
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && currentElement && !isDrawActivated) {
            const parentElement = currentElement.parentElement;
            const parentRect = parentElement.getBoundingClientRect();

            const mouseX = e.clientX - parentRect.left;
            const mouseY = e.clientY - parentRect.top;

            const newLeft = mouseX - clickOffset.x;
            const newTop = mouseY - clickOffset.y;

            currentElement.style.left = `${newLeft}px`;
            currentElement.style.top = `${newTop}px`;
        }
    };

    // Helper function: Reset all editable elements
    const resetEditableElements = (rootElement) => {
        const editableElements = Array.from(rootElement.querySelectorAll('[contentEditable="true"]'));
        editableElements.forEach(item => item.contentEditable = "false");
    };

    // Helper function: Apply styles from the selected element
    const applyElementStyles = (element) => {
        const computedStyle = getComputedStyle(element);

        // Parse the filter string
        const filterRegex = /(\w+)\(([^)]+)\)/g; // Matches filter name and value pairs
        const filterValues = {};
        const filterString = computedStyle.filter;

        // Extract individual filter values
        let match;
        while ((match = filterRegex.exec(filterString)) !== null) {
            const [_, filterName, value] = match;
            // Convert the value to a number if possible
            filterValues[filterName] = parseFloat(value);
        }

        // Define default values for filters (fallback if not present in the filter string)
        const {
            blur = 0,
            brightness = 1,
            contrast = 1,
            grayscale = 0,
            invert = 0,
            sepia = 0,
        } = filterValues;

        const styles = {
            width: computedStyle.width,
            height: computedStyle.height,
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            color: rgbToHex(computedStyle.color),
            backgroundColor: rgbToHex(computedStyle.backgroundColor),
            opacity: computedStyle.opacity,
            transform: computedStyle.transform,
            // Parsed filter values (converted to percentages where applicable)
            blur: blur, // in px
            brightness: brightness * 100, // in percentage
            contrast: contrast * 100, // in percentage
            grayscale: grayscale * 100, // in percentage
            invert: invert * 100, // in percentage
            sepia: sepia * 100, // in percentage
        };

        const transformValues = styles.transform.match(/matrix\((.+)\)/);
        styles.rotate = transformValues
            ? Math.round(Math.atan2(transformValues[1][1], transformValues[1][0]) * (180 / Math.PI))
            : 0;

        console.log(styles, 'styles');

        getElementStyles(styles);
    };

    // Helper function: Convert RGB to Hex
    const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        return `#${result}`;
    };

    const isTextElement = (element) => {
        const textTags = ['P', 'SPAN', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        return textTags.includes(element.tagName);
    };

    const saveWork = async () => {
        if (isSaving) {
            console.log('Save in progress. Please wait.');
            return;
        }

        setIsSaving(true);

        const workSpace = document.querySelectorAll('.previewArea');
        let pages = [];

        if (workSpace?.length) {
            workSpace.forEach(item => {
                const previewSpace = item;

                if (previewSpace) {
                    const tempHTML = previewSpace.cloneNode(true);

                    let outerHTML = previewSpace.cloneNode(true);
                    const elementsToRemove = outerHTML.querySelectorAll('[id*="pf"]');
                    elementsToRemove.forEach(element => element.remove());

                    const modifiedInnerHTML = outerHTML.innerHTML;

                    const pfContainer = tempHTML.querySelector('[id*="pf"]');
                    if (pfContainer) {
                        pfContainer.insertAdjacentHTML('beforeend', modifiedInnerHTML);
                    }

                    const width = tempHTML.style.width;
                    const height = tempHTML.style.height;

                    tempHTML.removeAttribute('style');
                    tempHTML.style.width = width;
                    tempHTML.style.height = height;

                    // reset the pdf focused element
                    const focusedElement = tempHTML.querySelectorAll('[data-id="true"]');
                    if (focusedElement?.length) {
                        focusedElement.forEach(item => {
                            item.style.border = '';
                            item.removeAttribute('data-id');
                        });
                    }

                    const elementsWithCursor = tempHTML.querySelectorAll('[style*="cursor"]');

                    elementsWithCursor.forEach(element => {
                        element.style.cursor = 'pointer';
                    });

                    const JSX = `${tempHTML.outerHTML}`;
                    pages.push(JSX);
                }
            });

            const pdfChanges = `
                      <!DOCTYPE html>
                      <html>
                      <head>
                          <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
                          <style>
                          ${document.getElementById('pdf-page-styles')?.innerHTML}
                          </style>
                          <script>
                           try{
                              pdf2htmlEX.defaultViewer = new pdf2htmlEX.Viewer({});
                           }catch(e){}
                          </script>
                      </head>
                      <body style="color:#000000;">
                          ${pages.join('')}
                      </body>
                      </html>
                    `;

            const user_id = localStorage.getItem('userId');
            const email = localStorage.getItem('email');
            if (pdfId && user_id && email && pdfChanges) {
                const generatePreview = document.querySelector('.pdfPage-1');
                let imgUrl = '';
                if (generatePreview) {
                    await html2canvas(generatePreview).then(canvas => {
                        imgUrl = canvas.toDataURL('image/png');
                    }).catch(error => {
                        console.error('Error generating preview:', error);
                    });
                }
                const payload = {
                    pdf_id: pdfId,
                    title_name: pdfTitle,
                    embedded_pages: encodeURIComponent(pdfChanges),
                    user_id,
                    email,
                    imgUrl,
                    pdfType: pdfCategory,
                    edit_id: existingEditId
                };
                const autosave = document.getElementById('autosave-icon');
                if (autosave) {
                    autosave.classList.add('animate-pulse', 'glow-animation');
                    setTimeout(() => {
                        autosave.classList.remove('animate-pulse', 'glow-animation');
                    }, 1000);
                }

                try {
                    const response = await saveEditedHTML(payload);
                    if (response.status === 201) {
                        console.log('Save successful!');
                        const newEditId = response.data?.edit_id;
                        if (newEditId) {
                            localStorage.setItem('editId', newEditId);
                        }
                    } else {
                        console.error('Save failed:', response.status);
                    }
                } catch (error) {
                    console.error('Save error:', error);
                }
            }
        }

        setIsSaving(false);
    };

    const updateDisableStatus = (props) => {
        setUndoRedoStatus(props);
    }

    const handleClick = () => {
        colorPickerRef.current.click();
    };

    useEffect(() => {
        const loadPdf = async () => {

            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = pdfPages;
            const pagesCount = tempContainer.querySelectorAll('[id*="pf"]');

            if (pagesCount?.length) {
                for (let index = 1; index < pagesCount?.length; index++) {
                    if (components?.length <= index) {
                        newComponent();
                    }
                }

                if (components?.length > pagesCount?.length) {
                    document.querySelectorAll('[name="main_frame"]').forEach(function (element, index) {
                        if (index >= pagesCount?.length) {
                            setTimeout(() => {
                                element.remove();
                            }, 100);
                        }
                    });

                    setComponents(prevState => ([...prevState].slice(0, pagesCount?.length)));
                }
            }
        };
        if (pdfPages) {
            loadPdf();
        }
    }, [pdfPages]);

    useEffect(() => {

        const handleEventClick = async (event) => {
            if (event.target.id === "pdfContainer") {
                await setCurrentComponent('');
                const currentPreview = sessionStorage.getItem('currentPreview');
                if (currentPreview && currentPreview !== "draw") {
                    sessionStorage.removeItem('currentPreview');
                }

                document.querySelectorAll('[data-id="true"]').forEach(el => {
                    el.style.border = 'none';
                    el.removeAttribute('data-id');
                    el.contentEditable = "false";
                    removeResizeHandlers();
                });
            }
        }

        window.addEventListener('click', handleEventClick);
        window.addEventListener('beforeunload', () => {
            sessionStorage.removeItem('currentPreview');
        })

        return () => {
            window.removeEventListener('click', handleEventClick);
        };

    }, []);

    useEffect(() => {
        if (state) sessionStorage.setItem('currentPreview', state);
    }, [state])

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoaded(true);
        }, 3800);

        return () => clearTimeout(timer);
    }, [window.location.pathname]);

    useEffect(() => {
        let isIndexZero = false;
        const handleScroll = () => {
            pageRefs.current.forEach((page, index) => {
                if (page) {
                    const rect = page.getBoundingClientRect();
                    const isInViewport = rect.top >= 0 && rect.top < window.innerHeight * 0.7;
                    if (isInViewport) {
                        if (index === 0 || isIndexZero) {
                            index++;
                            isIndexZero = true;
                        }
                        setCurrentPage(index);
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [pageRefs.current]);

    useEffect(() => {
        const runPreventStatus = () => {
            if (preventStatus && JSX.length > 0) {
                const maxLength = JSX?.length;
                let newPosition = currentPosition;
                const history = JSX;

                if (preventStatus.includes('undo')) {
                    if (newPosition >= 1) {
                        newPosition -= 1;
                        if (newPosition >= 1) {
                            updateDisableStatus({ key: '', status: false });
                        } else {
                            updateDisableStatus({ key: 'undo', status: true });
                        }
                    } else {
                        updateDisableStatus({ key: 'undo', status: true });
                    }
                    if (history[newPosition]) {
                        const selectedJSX = history[newPosition];
                        const stages = document.querySelectorAll('.previewArea');
                        if (stages?.length) {
                            _.forEach(stages, (stage, index) => {
                                stage.innerHTML = selectedJSX[index] || '';
                                stage.addEventListener('click', handlePdfPageController);
                                stage.addEventListener('mouseover', handlePdfPageController);
                                stage.addEventListener('mouseout', handlePdfPageController);
                                stage.addEventListener('mousedown', handlePdfPageController);
                                stage.addEventListener('mouseup', handlePdfPageController);
                                stage.addEventListener('mousemove', handleMouseMove);
                            })
                        }
                    }
                } else if (preventStatus.includes('redo')) {
                    if (newPosition < maxLength) {
                        newPosition += 1;
                        updateDisableStatus({ key: '', status: false });
                    }
                    if (newPosition === maxLength) {
                        updateDisableStatus({ key: 'redo', status: true });
                    }
                    if (history[newPosition]) {
                        const selectedJSX = history[newPosition];
                        const stages = document.querySelectorAll('.previewArea');
                        if (stages?.length) {
                            _.forEach(stages, (stage, index) => {
                                stage.innerHTML = selectedJSX[index] || '';
                                stage.addEventListener('click', handlePdfPageController);
                                stage.addEventListener('mouseover', handlePdfPageController);
                                stage.addEventListener('mouseout', handlePdfPageController);
                                stage.addEventListener('mousedown', handlePdfPageController);
                                stage.addEventListener('mouseup', handlePdfPageController);
                                stage.addEventListener('mousemove', handleMouseMove);
                            })
                        }
                    }
                }

                if (newPosition !== currentPosition) {
                    setCurrentPosition(newPosition);
                }
            }
        };

        runPreventStatus();
    }, [preventStatus]);

    const IsElementUpdated = () => {
        setIsElementAdded(isElementAdded + 1);
    }

    const updateStore = (key = '') => {
        const executeFunction = () => {
            const stages = document.querySelectorAll('.previewArea');
            if (stages.length) {
                let store = {};
                _.forEach(stages, (element, index) => {
                    store[index] = element.innerHTML;
                });
                if (JSX?.length > 10) {
                    let updatedJsx = [...JSX].slice(1);
                    updatedJsx.push(store);
                    setJSX(updatedJsx);
                } else {
                    let jsx = [...JSX];
                    jsx.push(store);
                    setJSX(jsx);
                }
                setCurrentPosition(currentPosition + 1);
                updateDisableStatus({ key: '', status: false });
            }
        };

        if (key === 'renderWithDelay') {
            setTimeout(executeFunction, 4000);
        } else {
            executeFunction();
        }
    };

    useEffect(() => {
        if (isElementUpdated || isElementAdded) {
            updateStore();
        }
    }, [isElementUpdated, isElementAdded]);

    useEffect(() => {
        const interval = setInterval(() => {
            updateStore('renderWithDelay');
            setElements('design');
            setState('design');
            const rulerContainer = document.querySelector('.rulerContainer');
            if (rulerContainer !== null) {
                let scriptText = ``;
                const selector = `.rulerContainer`;
                scriptText += `jquery('${selector}').ruler();`;

                if (scriptText) {
                    const script = document.createElement('script');
                    script.id = 'jquery-ruler-script';
                    script.type = 'text/javascript';
                    script.text = scriptText;
                    document.body.appendChild(script);
                }
            }
            clearInterval(interval);
        }, 4000);
    }, []);

    const handleAlert = (data) => {
        if (data.alertStatus) {
            setSnackbarOpen(true);
            setSnackbarMessage(data.message);
            setSnackbarSeverity(data.apiStatus)
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            applyEditingRuler: e.target.checked,
        }));
    };

    return (

        <React.Fragment>
            <Dialog open={popupOpen} onClose={() => setPopupOpen(false)}>
                <DialogTitle>Access Denied</DialogTitle>
                <DialogContent>
                    <p>You do not have permission to access this link.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* <PlaceHolder /> */}
            {!isPageLoaded ? <PlaceHolder /> : (
                <div className='min-w-screen bg-[#f6f7f8]'>
                    <Header setSaveStatus={() => { saveWork() }} preventKey={(key) => { setPreventStatus(key) }} status={undoRedoStatus} pdfId={pdfId} addNewPage={() => {
                        newComponent();
                    }} />
                    <div className='flex h-[calc(100%-60px)]'>

                        {/* sidebar menu */}
                        <div className='fixed mt-[75px] w-[80px] h-[100%] bg-[#f6f7f8] text-[rgba(0,0,0,0.6)] overflow-y-auto z-30'>
                            <Tippy content={<span className='text-[12px]'>Design</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('design'); setState('design') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group" >
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#13a3b5] ${state === 'design' && "text-[#13a3b5]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M3 11.325c0-3.59 0-5.385.966-6.61a4.5 4.5 0 0 1 .748-.749C5.94 3 7.734 3 11.325 3h1.35c3.59 0 5.386 0 6.61.966.279.22.53.47.749.748C21 5.94 21 7.734 21 11.325v1.35c0 3.59 0 5.386-.966 6.61-.22.279-.47.53-.748.749-1.226.966-3.02.966-6.611.966h-1.35c-3.59 0-5.385 0-6.61-.966a4.497 4.497 0 0 1-.749-.748C3 18.06 3 16.266 3 12.675v-1.35ZM11.325 4.5H13.5v15h-2.175c-1.83 0-3.076-.002-4.021-.111-.914-.105-1.356-.293-1.661-.533a3.004 3.004 0 0 1-.499-.499c-.24-.305-.428-.747-.533-1.661-.109-.945-.111-2.19-.111-4.021v-1.35c0-1.83.002-3.076.11-4.021.106-.914.293-1.356.534-1.661a3 3 0 0 1 .499-.499c.305-.24.747-.428 1.661-.533.945-.109 2.19-.111 4.021-.111ZM15 19.486c.666-.014 1.22-.042 1.696-.097.914-.105 1.356-.293 1.661-.533.186-.146.353-.314.499-.499.24-.305.428-.747.533-1.661.109-.945.111-2.19.111-4.021v-1.657H15v8.468Zm4.494-9.968c-.01-.904-.037-1.619-.105-2.214-.105-.914-.293-1.356-.533-1.661a3.004 3.004 0 0 0-.499-.499c-.305-.24-.747-.428-1.661-.533A18.58 18.58 0 0 0 15 4.514v5.004h4.494Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Design</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Elements</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('element', 'svg'); setState('element') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#992bff] ${state === 'element' && "text-[#992bff]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M6.55 11.242a1.502 1.502 0 0 0 1.42 0l.002-.002.004-.002.01-.005.026-.015.084-.048a9.986 9.986 0 0 0 1.14-.787c.638-.51 1.478-1.312 2.026-2.375a2.991 2.991 0 0 0-4.003-4.16A2.991 2.991 0 0 0 3.2 7.912c.54 1.103 1.402 1.93 2.055 2.454a10.007 10.007 0 0 0 1.25.854l.028.015.01.005.003.002.002.001ZM4.53 7.217c.352.731.918 1.34 1.444 1.794a8.454 8.454 0 0 0 1.285.91s.086-.047.229-.136a8.452 8.452 0 0 0 1.054-.776c.51-.442 1.058-1.03 1.41-1.734a1.491 1.491 0 1 0-2.693-1.208 1.493 1.493 0 0 0-1.435-1.084A1.491 1.491 0 0 0 4.53 7.217ZM17.536 4.011a1.026 1.026 0 0 0-1.775 0l-3.307 5.694a1.026 1.026 0 0 0 .888 1.542h6.614c.79 0 1.285-.857.887-1.542l-3.307-5.694ZM16.65 5.47l-2.485 4.277h4.969L16.649 5.47ZM20.861 17.168a4.213 4.213 0 1 1-8.425 0 4.213 4.213 0 0 1 8.425 0Zm-1.5 0a2.713 2.713 0 1 1-5.425 0 2.713 2.713 0 0 1 5.425 0ZM3.406 14.086a.77.77 0 0 1 .77-.77h6.14a.77.77 0 0 1 .77.77v6.294c0 .34-.275.616-.615.616H4.176a.77.77 0 0 1-.77-.77v-6.14Zm1.5 5.41v-4.68h4.68v4.68h-4.68Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Elements</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Draw</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('draw'); setState('draw'); }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#0ba84a] ${state === 'draw' && "text-[#0ba84a]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M20.07 3.456a3.135 3.135 0 0 0-4.434 0L10.25 8.843a3.38 3.38 0 0 0-.884 1.55l-.845 3.292c-.205.8.522 1.527 1.322 1.323l3.278-.837a3.384 3.384 0 0 0 1.555-.886L20.07 7.89a3.135 3.135 0 0 0 0-4.434Zm-2.117 4.43 1.057-1.057a1.635 1.635 0 0 0-2.313-2.313l-1.056 1.057 2.312 2.312Zm-1.166 1.166-3.172 3.172c-.24.24-.539.41-.866.493l-2.602.665.67-2.616a1.88 1.88 0 0 1 .492-.862l3.165-3.164 2.313 2.312Z" fill="currentColor"></path><path d="M5.144 15.022a.641.641 0 1 0 0 1.282h13.751a2.109 2.109 0 0 1 0 4.218H9.194a.75.75 0 0 1 0-1.5h9.701a.609.609 0 1 0 0-1.218H5.144a2.141 2.141 0 0 1 0-4.282h1.862v1.5H5.144Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Draw</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Upload</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('uploadImage'); setState('image') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#ff6105] ${state === 'image' && "text-[#ff6105]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.24 2.985c-2.735 0-5.04 2.075-5.316 4.788a.199.199 0 0 1-.123.162 5.729 5.729 0 0 0 1.994 11.097 5.727 5.727 0 0 0 5.727-5.727v-.486l1.782 1.782a.75.75 0 0 0 1.06-1.06l-3.062-3.063a.75.75 0 0 0-1.06 0L9.179 13.54a.75.75 0 0 0 1.06 1.06l1.783-1.781v.486A4.227 4.227 0 1 1 6.324 9.34a1.698 1.698 0 0 0 1.092-1.416c.198-1.943 1.855-3.44 3.825-3.44a3.848 3.848 0 0 1 3.785 3.174c.135.764.78 1.366 1.563 1.43 2.146.178 3.855 2.016 3.855 4.216a4.226 4.226 0 0 1-4.227 4.227h-1.914a.75.75 0 0 0 0 1.5h1.914a5.727 5.727 0 0 0 5.727-5.727c0-2.978-2.305-5.468-5.231-5.71a.25.25 0 0 1-.21-.196 5.348 5.348 0 0 0-5.262-4.414Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Upload</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Text</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('text'); setState('text') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#992bff] ${state === 'text' && "text-[#992bff]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.266 5.792a1.5 1.5 0 0 1 1.5-1.5h12.468a1.5 1.5 0 0 1 1.5 1.5v1.85a.75.75 0 0 1-1.5 0v-1.35a.5.5 0 0 0-.5-.5H12.75v11.939a.5.5 0 0 0 .5.5h1.875a.75.75 0 0 1 0 1.5h-6.25a.75.75 0 1 1 0-1.5h1.875a.5.5 0 0 0 .5-.5V5.792H6.266a.5.5 0 0 0-.5.5V7.67a.75.75 0 1 1-1.5 0V5.792Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Text</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Projects</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('projects'); setState('projects') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#333] ${state === 'projects' && "text-[#333]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M10.845 2.942H7.03a4 4 0 0 0-4 3.994l-.017 10a4 4 0 0 0 4 4.006h9.993a4 4 0 0 0 4-4v-8.23a3 3 0 0 0-3-3h-3.614a.5.5 0 0 1-.447-.277l-.417-.834a3 3 0 0 0-2.683-1.659Zm-3.815 1.5h3.815a1.5 1.5 0 0 1 1.341.83l.417.834a2 2 0 0 0 1.79 1.106h3.613a1.5 1.5 0 0 1 1.5 1.5v.735H4.526l.004-2.509a2.5 2.5 0 0 1 2.5-2.495Zm-2.507 6.505-.01 5.991a2.5 2.5 0 0 0 2.5 2.505h9.993a2.5 2.5 0 0 0 2.5-2.5v-5.996H4.523Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Projects</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Images</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('images', 'png'); setState('initImage') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className="YIDmbA w-[35px] h-20px p-1 flex justify-center items-center group-hover:bg-slate-100 rounded-md group-hover:shadow-md transition-all duration-200 ease-in-out">
                                        <span aria-hidden="true" className={`NA_Img dkWypw group-hover:text-[#992bff] ${state === 'initImage' && "text-[#992bff]"}`}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.81 4.5h-1.62c-1.765 0-2.965.002-3.878.104-.884.098-1.315.273-1.613.497a3 3 0 0 0-.598.598c-.224.298-.4.729-.497 1.613-.102.913-.104 2.113-.104 3.878v1.62c0 1.765.002 2.965.104 3.878.085.77.23 1.196.413 1.49l7.773-7.773.03-.03c.484-.484.89-.89 1.256-1.183.384-.307.79-.546 1.287-.616.245-.035.495-.035.74 0 .496.07.903.309 1.287.616.365.292.772.7 1.257 1.184l.03.03.823.823v-.039c0-1.765-.002-2.965-.104-3.878-.098-.884-.273-1.315-.497-1.613a3.003 3.003 0 0 0-.598-.598c-.298-.224-.729-.4-1.613-.497-.913-.102-2.113-.104-3.878-.104ZM7.312 19.396c-.515-.057-.877-.14-1.147-.244l7.685-7.686c.522-.522.87-.869 1.163-1.103.28-.224.439-.285.561-.302.106-.015.212-.015.318 0 .122.017.28.078.56.302.293.234.642.581 1.164 1.103L19.5 13.35c-.002 1.475-.013 2.521-.104 3.338-.098.884-.273 1.315-.497 1.613-.17.227-.371.428-.598.598-.298.224-.729.4-1.613.497-.913.102-2.113.104-3.878.104h-1.62c-1.765 0-2.965-.002-3.878-.104ZM3.902 4.798C3 5.998 3 7.73 3 11.19v1.62c0 3.46 0 5.191.901 6.392.255.34.557.641.897.897C5.998 21 7.73 21 11.19 21h1.62c3.46 0 5.191 0 6.392-.901.34-.256.641-.557.897-.897.901-1.2.901-2.931.901-6.392v-1.62c0-3.46 0-5.191-.901-6.392a4.501 4.501 0 0 0-.897-.897C18.002 3 16.27 3 12.81 3h-1.62c-3.46 0-5.191 0-6.392.901a4.5 4.5 0 0 0-.897.897ZM8.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path>
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-xs font-medium'>Images</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Background</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('background', 'background'); setState('background') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className='text-2xl w-[35px] h-20px p-1 flex justify-center rounded-md group-hover:bg-slate-100'><TbBackground className={`text-[25px] flex justify-center items-center group-hover:text-[#333] ${state === 'background' && "text-[#333]"}`} /></span>
                                    <span className='text-xs font-medium'>Background</span>
                                </div>
                            </Tippy>

                            <Tippy content={<span className='text-[12px]'>Settings</span>} placement='right' offset={[2, 0]}>
                                <div onClick={() => { setElements('settings', 'settings'); setState('settings') }} className="w-full h-[72px] cursor-pointer flex justify-center flex-col items-center gap-1 group">
                                    <span className='text-2xl w-[35px] h-20px p-1 flex justify-center rounded-md group-hover:bg-slate-100'><CiSettings className={`text-[25px] flex justify-center items-center group-hover:text-[#333] ${state === 'settings' && "text-[#333]"}`} /></span>
                                    <span className='text-xs font-medium'>Settings</span>
                                </div>
                            </Tippy>
                        </div>

                        <div className='w-[calc(100%-0px)]'>
                            <div className={`${show.status ? 'p-0 -left-[50%]' : `left-[85px] py-5`} p-1 bg-[#f6f7f8] shadow-lg h-full fixed w-[350px] z-30`} style={{ marginTop: '60px', borderLeft: '2px solid rgba(0,0,0,0.1)', borderRight: '3px solid rgba(0,0,0,0.03)' }}>
                                {
                                    state === 'design' && <div>
                                        <div className='w-full h-auto overflow-hidden -mt-[14px]'>
                                            {<TemplateDesign showPdfUrl={showPdfUrl} createComponentRef={createComponentRef} />}
                                        </div>
                                    </div>
                                }
                                {
                                    state === 'image' && <div className='h-[80vh] overflow-x-auto flex justify-start items-start 
                                        scrollbar-hide -mt-[14px]'>
                                        <MyImages setAddElement={setAddElement} handleAlert={handleAlert} createComponentRef={createComponentRef} />
                                    </div>
                                }
                                {
                                    state === 'text' && <React.Fragment><div>
                                        <div className='grid grid-cols-1 gap-2'>
                                            <button draggable onDragStart={() => handleDragStart('text', 'p')} onDragEnd={handleDragEnd} className='bg-[#f6f7f8] hover:bg-[rgb(0,0,0,0.02)] cursor-pointer font-[400] p-3 text-[14px] text-[#333] text-xl rounded-md border-[1px] solid border-[rgba(0,0,0,0.2)] flex items-center justify-center max-h-[45px]'>
                                                Add a text box
                                            </button>
                                        </div>
                                    </div>
                                        <div className="text-[#333] my-[21px] text-[17px] font-bold">
                                            Default text styles
                                        </div>
                                        <div className='grid grid-cols-1 gap-2'>
                                            <p draggable onDragStart={() => handleDragStart('text', 'h3')} onDragEnd={handleDragEnd} className='bg-[#f6f7f8] hover:bg-[rgb(0,0,0,0.02)] cursor-pointer font-[400] p-3 text-[14px] text-[#333] text-xl rounded-md border-[1px] solid border-[rgba(0,0,0,0.2)] flex items-center justify-center max-h-[45px]'>
                                                Add a heading
                                            </p>
                                        </div>
                                        <div className='grid grid-cols-1 gap-2'>
                                            <p draggable onDragStart={() => handleDragStart('text', 'h5')} onDragEnd={handleDragEnd} className='bg-[#f6f7f8] hover:bg-[rgb(0,0,0,0.02)] cursor-pointer font-[400] p-3 text-[14px] text-[#333] text-xl rounded-md border-[1px] solid border-[rgba(0,0,0,0.2)] flex items-center justify-center max-h-[45px]'>
                                                Add a sub heading
                                            </p>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    state === 'projects' && (
                                        <div className='h-[80vh] overflow-x-auto flex justify-start items-start scrollbar-hide -mt-[14px]'>
                                            <Pdf showPdfUrl={showPdfUrl} />
                                        </div>
                                    )
                                }
                                {
                                    state === 'element' && <div className='h-[80vh] overflow-x-auto flex justify-start items-start 
                                        scrollbar-hide -mt-[14px]'>
                                        <Elements myImages={elementImages} setAddElement={setAddElement} createComponentRef={createComponentRef} />
                                    </div>
                                }
                                {
                                    state === 'initImage' && <div className='h-[80vh] overflow-x-auto flex justify-start items-start 
                                        scrollbar-hide w-full -mt-[14px]'>
                                        <Image myImages={pngImages} setAddElement={setAddElement} isLoaded={isLoaded} createComponentRef={createComponentRef} />
                                    </div>
                                }
                                {
                                    state === 'background' && <div className='h-[80vh] overflow-x-auto flex justify-start items-start 
                                        scrollbar-hide -mt-[14px]'>
                                        <Background myImages={backgroundImages} setAddElement={setAddElement} isLoaded={isLoaded} createComponentRef={createComponentRef} />
                                    </div>
                                }
                                {
                                    state === 'settings' && <div className='h-[80vh] overflow-x-auto flex flex-col justify-start items-start 
                                        scrollbar-hide -mt-[14px] -ml-[30px]'>
                                        <ul className="w-full">
                                            <li className="bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900 p-2 rounded-sm text-white cursor-pointer">
                                                Yearbook Settings
                                            </li>
                                            <li className="p-2 flex gap-2 items-center text-black">
                                                <input
                                                    id='applyEditingRuler'
                                                    type="checkbox"
                                                    checked={settings.applyEditingRuler}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor='applyEditingRuler' className='mt-2 cursor-pointer'>Apply Editing Ruler</label>
                                            </li>
                                            <button
                                                className="bg-gradient-to-b from-purple-900 via-[rgba(255,255,255, 0.8)] to-indigo-900 text-white py-1 px-2 rounded-sm mt-2"
                                                onClick={() => {
                                                    sessionStorage.setItem('settings', JSON.stringify({ applyEditingRuler: settings?.applyEditingRuler }));
                                                    window.location.reload();
                                                }}
                                            >
                                                Apply Changes
                                            </button>
                                        </ul>
                                    </div>
                                }
                                {
                                    state === 'draw' && <div className='h-[350px] overflow-x-auto flex flex-col justify-start items-start scrollbar-hide -mt-[40px] ml-[10px]'>
                                        <button
                                            className="mt-[20px] w-full text-left py-[10px] px-3 font-semibold text-gray-800 flex justify-between items-center hover:bg-blue-100 transition-all duration-200 ease-in-out sticky top-0 bg-white z-10"
                                        >
                                            <span className="text-md text-[rgba(0,0,0,0.7)]">Select the sketch</span>
                                        </button>
                                        <Draw storeDrawData={storeDrawData} />
                                    </div>
                                }
                            </div>
                            <div className='w-full flex'>
                                <div className="relative justify-center items-center h-full min-h-[100vh] w-full overflow-y-auto bg-white" style={{ margin: '0 0 0 81px' }}>
                                    <div id='pdfContainer' className='w-[75%] ml-[22.5%] bg-white min-h-[90vh] h-full mt-[60px] flex justify-center items-center overflow-hidden'>
                                        <div id='pdfContainer' className={`relative w-[41.5%] min-h-[77vh] ${JSON.parse(sessionStorage.getItem('settings'))?.applyEditingRuler ? 'rulerContainer' : ''} ml-3 mr-3 flex flex-wrap `}>
                                            <div>
                                                {components.map((c, i) => (
                                                    <div key={i} ref={(el) => (pageRefs.current[i] = el)} data-pageid={i + 1} className={`-mt-[17px] -ml-5`}>
                                                        <div style={{ width: `${frameCoordinates.bleedAreaX}px`, height: `${frameCoordinates.bleedAreaY}px`, border: '2px solid #333' }} className={`frameBleed flex items-center mt-[12px] ml-[18px] justify-center relative frameBox-${i + 1} scale-[0.9]`}
                                                            onClick={handlePdfPageController}
                                                            onMouseOver={handlePdfPageController}
                                                            onMouseOut={handlePdfPageController}
                                                            onMouseDown={handlePdfPageController}
                                                            onMouseUp={handlePdfPageController}
                                                            onMouseMove={handleMouseMove}
                                                        >
                                                            {/* <span className='absolute w-[2px] h-full bg-black cbd'></span> */}
                                                            <div id='FramePage' style={{ width: `${frameCoordinates.pageSizeX}px`, height: `${frameCoordinates.pageSizeY}px`, border: '2px solid #ef4444' }} className={`flex items-center justify-center`}>
                                                                <CreateComponent
                                                                    key={i}
                                                                    index={i}
                                                                    info={c}
                                                                    createComponentRef={createComponentRef}
                                                                    pdfPages={pdfPages}
                                                                    pageIndex={i + 1}
                                                                    setElementStyles={editOptions}
                                                                    selectedElement={selectedElement}
                                                                    drawState={drawState}
                                                                    isSectionActivated={isSectionActivated}
                                                                    reset={reset}
                                                                    setIsElementUpdated={IsElementUpdated}
                                                                    handlePdfPageController={handlePdfPageController}
                                                                    handleMouseMove={handleMouseMove}
                                                                    setIsDrawActivated={setIsDrawActivated}
                                                                    frameCoordinates={frameCoordinates}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    isEditorActive &&
                                    <div
                                        ref={containerRef}
                                        className="fixed w-[41%] h-[45px] bg-[#f6f7f8] p-3 z-10 mt-0 border-[1px] border-solid shadow-lg overflow-y-visible scrollbar-hide flex gap-3 flex-row items-center justify-center rounded-full"
                                        style={{ top: `105px`, right: `14.6%`, userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                                    >
                                        <select
                                            onChange={(e) => setEditOptions(prevState => ({ ...prevState, fontFamily: e.target.value }))}
                                            className="h-[30px] w-[100px] text-ellipsis px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5b53e0] transition duration-200 ease-in-out"
                                        >
                                            <option value="'Arial', sans-serif">Arial</option>
                                            <option value="'Arial Black', sans-serif">Arial Black</option>
                                            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                                            <option value="'Courier New', monospace">Courier New</option>
                                            <option value="'Georgia', serif">Georgia</option>
                                            <option value="'Times New Roman', serif">Times New Roman</option>
                                            <option value="'Verdana', sans-serif">Verdana</option>
                                            <option value="'Tahoma', sans-serif">Tahoma</option>
                                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                                            <option value="'Lucida Sans Unicode', sans-serif">Lucida Sans Unicode</option>
                                            <option value="'Palatino Linotype', serif">Palatino Linotype</option>
                                            <option value="'Impact', sans-serif">Impact</option>
                                            <option value="'Segoe UI', sans-serif">Segoe UI</option>
                                            <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                                            <option value="'Merryweather', serif">Merryweather</option>
                                            <option value="'Open Sans', sans-serif">Open Sans</option>
                                            <option value="'Roboto', sans-serif">Roboto</option>
                                            <option value="'Lato', sans-serif">Lato</option>
                                            <option value="'Montserrat', sans-serif">Montserrat</option>
                                            <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                                            <option value="'Raleway', sans-serif">Raleway</option>
                                            <option value="'Oswald', sans-serif">Oswald</option>
                                            <option value="'PT Sans', sans-serif">PT Sans</option>
                                            <option value="'Dancing Script', cursive">Dancing Script</option>
                                            <option value="'Cursive', cursive">Cursive</option>
                                        </select>
                                        <div className="inline-flex items-center w-[100px] h-[30px] overflow-hidden border border-gray-300 rounded-sm shadow">
                                            <button
                                                className="w-[30px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium border-r border-gray-300"
                                                onClick={() =>
                                                    setEditOptions(prevState => ({
                                                        ...prevState,
                                                        fontSize: Number(parseInt(prevState.fontSize) - 1),
                                                    }))
                                                }
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min={0}
                                                value={typeof editOptions.fontSize === "number"
                                                    ? editOptions.fontSize
                                                    : editOptions.fontSize?.replace("px", "")}
                                                onChange={(e) =>
                                                    setEditOptions(prevState => ({
                                                        ...prevState,
                                                        fontSize: Number(e.target.value),
                                                    }))
                                                }
                                                className="w-[40px] text-center py-1 text-gray-700 border-0 focus:outline-none"
                                            />
                                            <button
                                                className=" w-[30px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium border-l border-gray-300"
                                                onClick={() =>
                                                    setEditOptions(prevState => ({
                                                        ...prevState,
                                                        fontSize: Number(parseInt(prevState.fontSize) + 1),
                                                    }))
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="w-[30px] h-[30px]">
                                            <div
                                                className="flex relative items-center justify-center bg-gray-200 shadow cursor-pointer"
                                                onClick={handleClick}
                                            >
                                                <span className="text-xl font-[600] text-gray-700">A</span>
                                                <span
                                                    className="w-full h-[4px] absolute bottom-0"
                                                    style={{ backgroundColor: editOptions.color }}
                                                ></span>
                                            </div>

                                            <input
                                                ref={colorPickerRef}
                                                type="color"
                                                value={editOptions.color}
                                                style={{ visibility: 'hidden' }}
                                                onChange={(e) =>
                                                    setEditOptions(prevState => ({
                                                        ...prevState,
                                                        color: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="w-[30px] h-[30px]">
                                            <div className="flex relative items-center justify-center bg-gray-200 shadow cursor-pointer" onClick={() => setEditOptions(prevState => ({ ...prevState, bold: !editOptions.bold }))} >
                                                <span className="text-xl font-[600] text-gray-700">B</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="w-[30px] h-[30px] relative">
                                                <div
                                                    className="flex items-center justify-center bg-gray-200 h-full shadow cursor-pointer"
                                                    onClick={() => { setIsTransparencyVisible(false); setIsAlignmentVisible(false); setIsFilterVisible(false); setIsRangeVisible((prev) => !prev) }}
                                                >
                                                    <span className="text-xl font-[600] text-gray-700">
                                                        <FaSyncAlt />
                                                    </span>
                                                </div>

                                                {isRangeVisible && (
                                                    <div
                                                        className="absolute bg-gray-100 p-3 shadow rounded w-[200px] z-50"
                                                        style={{
                                                            top: "40px",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                        }}
                                                    >
                                                        <input
                                                            type="range"
                                                            min={-180}
                                                            max={180}
                                                            value={editOptions.rotate}
                                                            className="w-full"
                                                            onChange={(e) =>
                                                                setEditOptions((prevState) => ({
                                                                    ...prevState,
                                                                    rotate: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        <div className="text-center text-sm mt-1">
                                                            Rotation: {editOptions.rotate}°
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="w-[30px] h-[30px] relative">
                                                <div
                                                    className="flex items-center justify-center bg-gray-200 h-full shadow cursor-pointer"
                                                    onClick={() => { setIsRangeVisible(false); setIsAlignmentVisible(false); setIsFilterVisible(false); setIsTransparencyVisible((prev) => !prev); }}
                                                >
                                                    <span className="text-xl font-[600] text-gray-700">
                                                        <RxTransparencyGrid />
                                                    </span>
                                                </div>

                                                {isTransparencyVisible && (
                                                    <div
                                                        className="absolute bg-gray-100 p-3 shadow rounded w-[200px] z-50"
                                                        style={{
                                                            top: "40px",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                        }}
                                                    >
                                                        <input
                                                            type="range"
                                                            min={0}
                                                            max={1}
                                                            step="0.1"
                                                            value={editOptions.opacity}
                                                            className="w-full"
                                                            onChange={(e) =>
                                                                setEditOptions((prevState) => ({
                                                                    ...prevState,
                                                                    opacity: e.target.value,
                                                                }))
                                                            }
                                                        />
                                                        <div className="text-center text-sm mt-1">
                                                            Transparency: {editOptions.opacity}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-[30px] h-[30px]">
                                            <div className="flex relative items-center h-full justify-center bg-gray-200 shadow cursor-pointer" >
                                                <button
                                                    className={`text-[rgba(0,0,0,0.6)] font-medium rounded transition duration-200`}
                                                    onClick={() => setEditOptions(prevState => ({ ...prevState, italic: !prevState.italic }))}
                                                    title="Italic">
                                                    <FaItalic />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-[30px] h-[30px]">
                                            <div className="flex relative items-center h-full justify-center bg-gray-200 shadow cursor-pointer" >
                                                <button
                                                    className={`text-[rgba(0,0,0,0.6)] font-medium rounded transition duration-200`}
                                                    onClick={() => setEditOptions(prevState => ({ ...prevState, underline: !prevState.underline }))}
                                                    title="Underline">
                                                    <FaUnderline />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="w-[30px] h-[30px] relative">
                                                <div
                                                    className="flex items-center justify-center bg-gray-200 h-full shadow cursor-pointer"
                                                    onClick={() => { setIsRangeVisible(false); setIsTransparencyVisible(false); setIsFilterVisible(false); setIsAlignmentVisible((prev) => !prev) }}
                                                >
                                                    <span className="text-xl font-[600] text-gray-700">
                                                        <MdOutlineFormatAlignCenter />
                                                    </span>
                                                </div>

                                                {isAlignmentVisible && (
                                                    <div
                                                        className="absolute bg-gray-100 p-3 shadow rounded w-[200px] z-50"
                                                        style={{
                                                            top: "40px",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                        }}
                                                    >
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <span className='col-span-full text-[14px]'>AlignmentX</span>
                                                            <button
                                                                className={`${editOptions?.left && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, left: !prevState.left, middle: false, right: false }))}
                                                                title="Align Left">
                                                                <FaAlignLeft />
                                                            </button>
                                                            <button
                                                                className={`${editOptions?.middle && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, middle: !prevState.middle, left: false, right: false }))}
                                                                title="Align Center">
                                                                <FaAlignCenter />
                                                            </button>
                                                            <button
                                                                className={`${editOptions?.right && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, right: !prevState.right, left: false, middle: false }))}
                                                                title="Align Right">
                                                                <FaAlignRight />
                                                            </button>
                                                            <span className='col-span-full text-[14px]'>AlignmentY</span>
                                                            <button
                                                                className={`${editOptions?.top && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, top: !prevState.top, middleVertical: false, bottom: false }))}
                                                                title="Align Top">
                                                                <MdVerticalAlignTop />
                                                            </button>
                                                            <button
                                                                className={`${editOptions?.middleVertical && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, middleVertical: !prevState.middleVertical, top: false, bottom: false }))}
                                                                title="Align Middle">
                                                                <MdOutlineVerticalAlignCenter />
                                                            </button>
                                                            <button
                                                                className={`${editOptions?.bottom && "bg-gray-500 text-white"} text-[rgba(0,0,0,0.6)] font-medium py-2 px-3 rounded transition duration-200 border border-gray-500`}
                                                                onClick={() => setEditOptions(prevState => ({ ...prevState, bottom: !prevState.bottom, top: false, middleVertical: false }))}
                                                                title="Align Bottom">
                                                                <MdVerticalAlignBottom />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <div className="w-[30px] h-[30px] relative">
                                                <div
                                                    className="flex items-center justify-center bg-gray-200 h-full shadow cursor-pointer"
                                                    onClick={() => { setIsRangeVisible(false); setIsTransparencyVisible(false); setIsAlignmentVisible(false); setIsFilterVisible((prev) => !prev) }}
                                                >
                                                    <span className="text-xl font-[600] text-gray-700">
                                                        <CiFilter />
                                                    </span>
                                                </div>

                                                {isFilterVisible && (
                                                    <div
                                                        className="absolute bg-gray-100 p-3 shadow rounded w-[200px] z-50"
                                                        style={{
                                                            top: "40px",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                        }}
                                                    >
                                                        <div className='mt-2 col-span-2'>
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                Visual Filter Controls
                                                            </label>
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdBlurLinear className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Blur (px)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={0}
                                                                max={10}
                                                                value={editOptions.blur}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, blur: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdBrightnessMedium className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Brightness (%)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={50}
                                                                max={200}
                                                                value={editOptions.brightness}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, brightness: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdContrast className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Contrast (%)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={50}
                                                                max={200}
                                                                value={editOptions.contrast}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, contrast: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdOutlineGradient className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Grayscale (%)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={0}
                                                                max={200}
                                                                value={editOptions.grayscale}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, grayscale: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdInvertColors className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Invert (%)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={0}
                                                                max={100}
                                                                value={editOptions.invert}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, invert: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            <label className="flex items-center text-gray-700 font-medium mb-2 -ml-[0.5px]">
                                                                <MdPhotoFilter className='mr-2 text-[18px] text-[rgba(0,0,0,0.6)]' />
                                                                Sepia (%)
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min={0}
                                                                max={20}
                                                                value={editOptions.sepia}
                                                                className="w-full"
                                                                onChange={(e) => setEditOptions(prevState => ({ ...prevState, sepia: e.target.value }))}
                                                            />
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                className='fixed z-50'
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}
