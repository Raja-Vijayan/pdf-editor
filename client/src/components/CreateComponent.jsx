import React, { useEffect } from 'react';
import { getPdfPage } from '../helper/Helpers';
import _ from 'lodash';

export default function CreateComponent({ info, pdfPages, pageIndex, setElementStyles, selectedElement, drawState, isSectionActivated, reset, setIsElementUpdated, setIsDrawActivated, createComponentRef, frameCoordinates }) {

    var html = '';
    useEffect(() => {

        const renderPage = async () => {
            const pageElement = document.querySelector(`.frameBox-${pageIndex || 0}`);
            if (pageElement) {
                setTimeout(async () => {
                    const page = await getPdfPage(pageIndex, pdfPages);
                    pageElement.innerHTML = page;
                }, 200);
            }
        };

        if (pdfPages) {
            renderPage();
        }
    }, [pdfPages, pageIndex]);

    useEffect(() => {
        if (!selectedElement || !setElementStyles) return;

        const { fontSize, rotate, opacity, fontFamily, color, bold, italic, underline, left, right, middle, top, bottom, middleVertical, brightness, contrast, grayscale, invert, sepia, blur } = setElementStyles;

        console.log("Font Family :",fontFamily)
        // Apply common styles
        selectedElement.style.display = 'flex';
        selectedElement.style.opacity = opacity ?? '1';

        // Apply rotation
        if (rotate !== undefined) {
            selectedElement.style.transform = `rotate(${rotate}deg)`;
        }

        // Apply font-related styles
        if (fontSize) {
            const computedFontSize = parseFloat(window.getComputedStyle(selectedElement).fontSize.replace('px', ''));
            const currentWidth = selectedElement.offsetWidth;
            const multiplier = currentWidth / computedFontSize;
            const aspectRatio = selectedElement.offsetWidth / selectedElement.offsetHeight;

            selectedElement.style.fontSize = `${fontSize}px`;
            selectedElement.style.width = `${fontSize * multiplier}px`;
            selectedElement.style.height = `${(fontSize * multiplier) / aspectRatio}px`;
        }

        selectedElement.style.fontFamily = fontFamily || '';
        selectedElement.style.color = color || '';
        selectedElement.style.fill = color || ''; // For SVG elements
        selectedElement.style.fontWeight = bold ? 'bold' : 'normal';
        selectedElement.style.fontStyle = italic ? 'italic' : 'normal';
        selectedElement.style.textDecoration = underline ? 'underline' : 'none';

        const image = selectedElement.querySelector('img');
        let parentNode = null;

        if (image) {
            // Set the parentNode if the image block is executed
            parentNode = selectedElement.closest('.page-item');
        }

        const justifyContent = left ? 'flex-start' : right ? 'flex-end' : middle ? 'center' : '';
        const alignItems = top ? 'flex-start' : bottom ? 'flex-end' : middleVertical ? 'center' : '';

        // Calculate alignment styles based on absolute positioning
        if (parentNode) {
            // Adjust alignment based on the parentNode's dimensions
            const parentRect = parentNode.getBoundingClientRect();
            const elementRect = selectedElement.getBoundingClientRect();

            if (left) {
                selectedElement.style.left = '0';
                selectedElement.style.right = 'auto';
            } else if (right) {
                selectedElement.style.left = 'auto';
                selectedElement.style.right = '0';
            } else if (middle) {
                selectedElement.style.left = `${(parentRect.width - elementRect.width) / 2}px`;
                selectedElement.style.right = 'auto';
            }

            if (top) {
                selectedElement.style.top = '0';
                selectedElement.style.bottom = 'auto';
            } else if (bottom) {
                selectedElement.style.top = 'auto';
                selectedElement.style.bottom = '0';
            } else if (middleVertical) {
                selectedElement.style.top = `${(parentRect.height - elementRect.height) / 2}px`;
                selectedElement.style.bottom = 'auto';
            }
        } else {
            // Apply styles to the selectedElement if no parentNode exists
            if (justifyContent) selectedElement.style.textAlign = justifyContent === "flex-start" ? "left" : justifyContent === "flex-end" ? "right" : "center";
            if (justifyContent) selectedElement.style.justifyContent = justifyContent;
            if (alignItems) selectedElement.style.alignItems = alignItems;
        }

        // Apply image filters if the element or its child is an image
        const isImage = selectedElement.querySelector('img');
        if (isImage) {
            selectedElement.style.filter = `
                ${brightness !== undefined ? `brightness(${brightness}%)` : 'brightness(100%)'}
                ${contrast !== undefined ? `contrast(${contrast}%)` : 'contrast(100%)'}
                ${grayscale !== undefined ? `grayscale(${grayscale}%)` : 'grayscale(0%)'}
                ${invert !== undefined ? `invert(${invert}%)` : 'invert(0%)'}
                ${sepia !== undefined ? `sepia(${sepia}%)` : 'sepia(0%)'}
                ${blur !== undefined ? `blur(${blur}px)` : 'blur(0)'}
            `.trim();
        }
    }, [selectedElement, setElementStyles]);

    useEffect(() => {
        const isDrawActive = sessionStorage.getItem('currentPreview');
        if (drawState && isDrawActive) {
            setIsDrawActivated(true);
        } else {
            setIsDrawActivated(false);
        }

        const handleClickEvent = (e) => {
            if (sessionStorage.getItem('currentPreview') === 'draw') {
                const currentPage = e.target.closest('.previewArea');
                if (currentPage) {
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    const canvas = document.createElement('canvas');
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.width = screenWidth;
                    canvas.height = screenHeight;
                    canvas.style.zIndex = '100';
                    canvas.style.background = 'transparent';
                    currentPage.style.cursor = 'crosshair';
                    currentPage.appendChild(canvas);

                    const ctx = canvas.getContext('2d');
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = drawState?.selectedColor || 'red';

                    let isDrawing = false;
                    let startX = 0, startY = 0;
                    let minX = screenWidth, minY = screenHeight, maxX = 0, maxY = 0;

                    const updateBoundingBox = (x, y) => {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    };

                    const startDrawing = (e) => {
                        isDrawing = true;
                        const rect = canvas.getBoundingClientRect();
                        startX = e.clientX - rect.left;
                        startY = e.clientY - rect.top;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        updateBoundingBox(startX, startY);
                    };

                    const draw = (e) => {
                        if (!isDrawing) return;
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        updateBoundingBox(x, y);
                        startX = x;
                        startY = y;
                    };

                    const stopDrawing = (e) => {
                        if (isDrawing) {
                            isDrawing = false;
                            const rect = canvas.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            ctx.lineTo(x, y);
                            ctx.stroke();
                            ctx.closePath();

                            updateBoundingBox(x, y);

                            const drawnWidth = maxX - minX;
                            const drawnHeight = maxY - minY;

                            if (drawnWidth > 0 && drawnHeight > 0) {
                                const resizedCanvas = document.createElement('canvas');
                                resizedCanvas.width = (drawnWidth + 15);
                                resizedCanvas.height = (drawnHeight + 15);
                                resizedCanvas.style.zIndex = '100';
                                const resizedCtx = resizedCanvas.getContext('2d');

                                resizedCtx.drawImage(canvas, minX, minY, drawnWidth, drawnHeight, 0, 0, drawnWidth, drawnHeight);

                                const imageDataURL = resizedCanvas.toDataURL('image/png');
                                const imgElement = document.createElement('img');
                                imgElement.src = imageDataURL;

                                imgElement.style.position = 'absolute';
                                imgElement.style.pointerEvents = 'none';
                                imgElement.style.width = '100%';
                                imgElement.style.height = '100%';

                                currentPage.removeChild(canvas);
                                resizedCanvas.style.position = 'absolute';
                                resizedCanvas.style.top = `${minY}px`;
                                resizedCanvas.style.left = `${minX}px`;
                                currentPage.style.cursor = 'default';

                                const divElement = document.createElement('div');
                                divElement.style.position = 'absolute';
                                divElement.style.top = `${minY}px`;
                                divElement.style.left = `${minX}px`;
                                divElement.style.width = `${resizedCanvas.width}px`;
                                divElement.style.height = `${resizedCanvas.height}px`;
                                divElement.style.zIndex = '101';
                                divElement.classList.add('box');
                                divElement.appendChild(imgElement);

                                currentPage.appendChild(divElement);
                                setTimeout(() => {
                                    const canvasElement = currentPage.querySelectorAll('canvas');
                                    if (canvasElement?.length) {
                                        _.forEach(canvasElement, item => {
                                            item.remove();
                                        })
                                    }
                                }, 100);
                                setIsElementUpdated();
                                reset();
                            }
                        }
                    };

                    canvas.addEventListener('mousedown', startDrawing);
                    canvas.addEventListener('mousemove', draw);
                    canvas.addEventListener('mouseup', stopDrawing);
                    canvas.addEventListener('mouseleave', stopDrawing);
                }
            }
        };

        window.addEventListener('click', handleClickEvent);

        return (() => {
            window.removeEventListener('click', handleClickEvent);
        });

    }, [drawState, isSectionActivated]);

    if (info.name === 'main_frame') {
        html = (
            <div
                id='pdfContainer'
                ref={createComponentRef}
                name={info.name}
                className={`flex justify-center items-center previewArea pdfPage-${pageIndex} pdfPage overflow-hidden`}
                style={{
                    position: 'relative',
                    width: `${frameCoordinates.contentAreaX}px`,
                    height: `${frameCoordinates.contentAreaY}px`,
                    border: '2px solid #22c55e'
                }}
            >
            </div >
        );
    }
    return html;
}
