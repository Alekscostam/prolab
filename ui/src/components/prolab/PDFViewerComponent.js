import { Document, Page, pdfjs } from 'react-pdf';
import React, { useState, useEffect } from 'react';
import LocUtils from '../../utils/LocUtils';
import ShortcutButton from './ShortcutButton';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { readableStreamToArrayBuffer } from '../../utils/Buffer';

pdfjs.GlobalWorkerOptions.workerSrc = '/worker/pdf.worker.min.mjs';

const PDFViewerComponent = ({ labels,  file }) => {
    const [numPages, setNumPages] = useState(null);
    const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfMounted, setPdfMounted] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);                    
        setPdfMounted(true);

    };

    useEffect(() => {
        const loadPdf = async () => {
            if (file) {
                const arrayBuffer = await readableStreamToArrayBuffer(file);
                setPdfArrayBuffer(arrayBuffer);
            }
        };
        loadPdf();
    }, [file]);

    const page = () => {
        return (
            <b style={{ fontSize: "18px" }}>
                {`${LocUtils.loc(labels, 'Page', 'Strona')}  ${pageNumber}/${numPages}`}
            </b>
        );
    };

    return (
        <div className='container-fluid justify-content-center'>
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                wheel={{ step: 0.1 }}
            >
                {() => (
                    <TransformComponent>
                         <Document

                            renderMode='canvas'
                            file={pdfArrayBuffer}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                width={"650"}
                            />
                        </Document>
                    </TransformComponent>
                )}
            </TransformWrapper>
            {pdfMounted && <div>
                <p className='justify-content-center d-flex'>
                {page()}
            </p>
            <div className='float-right'>
                <ShortcutButton
                    id={'opNext'}
                    disabled={pageNumber >= numPages}
                    className={`grid-button-panel normal mt-1 mb-1 mr-1`}
                    handleClick={() => setPageNumber(pageNumber + 1)}
                    label={LocUtils.loc(labels, 'Next', 'Nastepna')}
                />
            </div>
            <div>
                <ShortcutButton
                    id={'opPrev'}
                    disabled={pageNumber <= 1}
                    className={`grid-button-panel normal mt-1 mb-1 mr-1`}
                    handleClick={() => setPageNumber(pageNumber - 1)}
                    label={LocUtils.loc(labels, 'Prev', 'Poprzednia')}
                />
            </div>
                </div>}
           
        </div>
    );
};

export default PDFViewerComponent;