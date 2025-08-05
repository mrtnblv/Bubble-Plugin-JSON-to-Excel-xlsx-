function(properties, context) {
    let jsonData = properties.rawjson;

    // Try to parse raw JSON
    if (typeof jsonData === 'string') {
        try {
            jsonData = JSON.parse(jsonData);
        } catch (err) {
            console.error("Invalid JSON string:", err);
            return;
        }
    }

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        console.error("Input must be a non-empty array.");
        return;
    }

    // Extract headers and data
    const headers = Object.keys(jsonData[0]);
    const data = [headers, ...jsonData.map(obj => headers.map(k => obj[k]))];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Optional column widths
    if (properties.colWidths) {
        ws['!cols'] = properties.colWidths
            .split(',')
            .map(w => parseInt(w.trim(), 10))
            .filter(w => !isNaN(w) && w > 0)
            .map(wch => ({ wch }));
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Generate binary and download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buffer = new Uint8Array(wbout.length);
    for (let i = 0; i < wbout.length; ++i) {
        buffer[i] = wbout.charCodeAt(i) & 0xFF;
    }

    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const fileName = (properties.filename || "export") + ".xlsx";

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Excel file downloaded:", fileName);
}
