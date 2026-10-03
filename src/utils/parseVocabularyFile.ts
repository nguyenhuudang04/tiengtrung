import * as XLSX from 'xlsx';
import type { ImportRow, ImportValidationResult, ImportSummary } from '@/types/import';
import type { VocabularyInsert } from '@/types/vocabulary';
import { getExistingSignatures } from '@/lib/vocabulary';

// Map diverse headers to standard keys
const headerMap: Record<string, keyof ImportRow> = {
  "từ vựng": "hanzi",
  "hanzi": "hanzi",
  "từ": "hanzi",
  
  "pinyin": "pinyin",
  "phiên âm": "pinyin",
  
  "nghĩa": "meaning_vi",
  "nghĩa tiếng việt": "meaning_vi",
  "meaning": "meaning_vi",
  "meaning_vi": "meaning_vi",
  
  "loại từ": "part_of_speech",
  "loại": "part_of_speech",
  "part_of_speech": "part_of_speech",
  
  "ví dụ tiếng trung": "example_cn",
  "ví dụ cn": "example_cn",
  "example_cn": "example_cn",
  
  "pinyin ví dụ": "example_pinyin",
  "example_pinyin": "example_pinyin",
  
  "dịch ví dụ": "example_vi",
  "nghĩa ví dụ": "example_vi",
  "example_vi": "example_vi",
  
  "level": "level",
  "cấp độ": "level",
  
  "category": "category",
  "chủ đề": "category",
  
  "ghi chú": "notes",
  "notes": "notes"
};

export const parseVocabularyFile = async (file: File): Promise<ImportSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File rỗng.");

        // Read workbook
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers array
        const rawJson: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawJson.length < 2) {
          throw new Error("File không có dữ liệu hoặc thiếu header.");
        }

        const headers = rawJson[0] as string[];
        const mappedHeaderIndexes: Record<number, keyof ImportRow> = {};

        headers.forEach((header, index) => {
          if (typeof header === 'string') {
            const cleanHeader = header.toLowerCase().trim();
            const mappedKey = headerMap[cleanHeader];
            if (mappedKey) {
              mappedHeaderIndexes[index] = mappedKey;
            }
          }
        });

        if (!Object.values(mappedHeaderIndexes).includes('hanzi') && 
            !Object.values(mappedHeaderIndexes).includes('pinyin') && 
            !Object.values(mappedHeaderIndexes).includes('meaning_vi')) {
          throw new Error("Không tìm thấy các cột bắt buộc: Từ vựng, Pinyin, Nghĩa.");
        }

        const parsedRows: ImportRow[] = [];
        
        // Parse rows starting from index 1 (skipping header)
        for (let i = 1; i < rawJson.length; i++) {
          const rowData = rawJson[i];
          // Skip completely empty rows
          if (!rowData || rowData.length === 0 || rowData.every((cell: unknown) => !cell || cell.toString().trim() === '')) {
            continue;
          }

          const row: ImportRow = { _rawRowIndex: i + 1 };
          
          Object.keys(mappedHeaderIndexes).forEach((indexStr) => {
            const idx = parseInt(indexStr);
            const key = mappedHeaderIndexes[idx];
            const cellValue = rowData[idx];
            if (cellValue !== undefined && cellValue !== null) {
              (row as any)[key] = cellValue.toString().trim();
            }
          });

          parsedRows.push(row);
        }

        // Fetch existing signatures to check for duplicates
        let existingSignatures = new Set<string>();
        try {
          existingSignatures = await getExistingSignatures();
        } catch (dbError) {
          console.warn("Không thể lấy dữ liệu duplicate check, bỏ qua check duplicate client-side.");
        }

        const validationResults: ImportValidationResult[] = [];
        let valid = 0;
        let invalid = 0;
        let duplicates = 0;
        let newValid = 0;

        parsedRows.forEach((row) => {
          const errors: string[] = [];
          
          if (!row.hanzi) errors.push("Thiếu Từ vựng (hanzi)");
          if (!row.pinyin) errors.push("Thiếu Pinyin");
          if (!row.meaning_vi) errors.push("Thiếu Nghĩa tiếng Việt");

          const isValid = errors.length === 0;
          
          let isDuplicate = false;
          let dataToInsert: VocabularyInsert | null = null;

          if (isValid) {
            const signature = `${row.hanzi}|${row.pinyin}|${row.meaning_vi}`;
            isDuplicate = existingSignatures.has(signature);
            
            dataToInsert = {
              hanzi: row.hanzi!,
              pinyin: row.pinyin!,
              meaning_vi: row.meaning_vi!,
              part_of_speech: row.part_of_speech || null,
              example_cn: row.example_cn || null,
              example_pinyin: row.example_pinyin || null,
              example_vi: row.example_vi || null,
              level: row.level || null,
              category: row.category || null,
              notes: row.notes || null,
            };

            valid++;
            if (isDuplicate) {
              duplicates++;
            } else {
              newValid++;
            }
          } else {
            invalid++;
          }

          validationResults.push({
            isValid,
            errors,
            data: dataToInsert,
            isDuplicate,
            raw: row
          });
        });

        resolve({
          total: parsedRows.length,
          valid,
          invalid,
          duplicates,
          newValid,
          rows: validationResults
        });

      } catch (err: any) {
        reject(new Error(err.message || "Lỗi xử lý file Excel/CSV."));
      }
    };

    reader.onerror = () => reject(new Error("Không thể đọc file."));
    
    // readAsBinaryString for xlsx
    reader.readAsBinaryString(file);
  });
};
