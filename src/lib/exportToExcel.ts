import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // إنشاء ورقة عمل من البيانات
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // إنشاء كتاب عمل
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // تصدير الملف
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
