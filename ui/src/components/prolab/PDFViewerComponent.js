
// import { Document, Page, pdfjs } from 'react-pdf';
// import React from 'react';
// import LocUtils from '../../utils/LocUtils';
// import ShortcutButton from './ShortcutButton';
// import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

// pdfjs.GlobalWorkerOptions.workerSrc = '/worker/pdf.worker.min.mjs';

// const PDFViewerComponent = (fileUrl,labels) => {
//     const [numPages, setNumPages] = React.useState(null);
//     const [pageNumber, setPageNumber] = React.useState(1);
  
//     const onDocumentLoadSuccess = ({ numPages }) => {
//       setNumPages(numPages);
//     };
  
//     const page =()=>{
//       return <b style={{fontSize:"18px"}}>{`${LocUtils.loc(labels, 'Page', 'Strona')}  ${pageNumber}/${numPages}`}</b> ;
//     }

//     return (
//       <div>
//         <TransformWrapper
//          initialScale={1}
//          minScale={0.5}
//          maxScale={5}
//          wheel={{ step: 0.1 }}
//        >
//         {({}) => (
//           <TransformComponent>
//               <Document 
//                 renderMode='canvas'
//                 file={"https://printingpolska.pl/wp-content/uploads/2017/12/Plik-testowy.pdf"}
//                 onLoadSuccess={onDocumentLoadSuccess}
//               >
//               <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false}/>
//             </Document>
//           </TransformComponent>
//         )}
//        </TransformWrapper>
        
//         <p className='justify-content-center d-flex'>
//         {page()}
//         </p>
//         <div className='float-right'>  
//           <ShortcutButton
//                 id={'opNext'}
//                 disabled={pageNumber >= numPages}
//                 className={`grid-button-panel normal mt-1 mb-1 mr-1`}
//                 handleClick={() => setPageNumber(pageNumber + 1)}
//                 label={LocUtils.loc(labels, 'Next', 'Nastepna')}
//             /></div>
//             <div>
//             <ShortcutButton
//                 id={'opPrev'}
//                 disabled={pageNumber <= 1}

//                 className={`grid-button-panel normal mt-1 mb-1 mr-1`}
//                 handleClick={() => setPageNumber(pageNumber - 1)}
//                 label={LocUtils.loc(labels, 'Prev', 'Poprzednia')}
//             />
//          </div>
       
//       </div>
//     );
//   };
  
//   export default PDFViewerComponent;
