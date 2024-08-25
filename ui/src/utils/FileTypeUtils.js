import { FileType } from "../model/FileType";
import { StringUtils } from "./StringUtils";

class FileTypeUtils {
    static getFileType(text) {
        if(!StringUtils.isBlank(text)){
            text = text.toUpperCase();
            if(text.includes(FileType.PDF))
                return FileType.PDF;
            else if(text.includes(FileType.XLSX))
                return FileType.XLSX;
            else if(text.includes(FileType.DOCX))
                return FileType.DOCX;
        }
        return '';
    }
}
export default FileTypeUtils;