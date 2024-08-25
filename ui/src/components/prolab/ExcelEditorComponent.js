import React, { useState, useEffect } from 'react';
import { readableStreamToArrayBuffer } from '../../utils/Buffer';
import * as XLSX from 'xlsx';
import Spreadsheet from 'react-spreadsheet';

const ExcelEditorComponent = ({ file }) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      const loadExcel = async () => {
        if (file) {
          try {
            const arrayBuffer = await readableStreamToArrayBuffer(file);
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            const rows = csv.split('\n').map(row => row.split(','));
            const formattedData = rows.map(row => 
                row.map(cell => ({ value: cell }))
            );
            setData(formattedData);
          } catch (error) {
            console.error("Error loading Excel file:", error);
          }
        }
      };
      loadExcel();
    }, [file]);
  
    return (
      <div className="container mr-4">
        {data.length > 0 && (
          <Spreadsheet  
            data={data}  
            readOnly={true} 
            onCellsChanged={()=>{}}
          />
        ) }
      </div>
    );
  };
  
  export default ExcelEditorComponent;