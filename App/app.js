// apps.js : 各アプリのバージョン情報を自動取得して表示する

document.addEventListener("DOMContentLoaded", () => {

    // すべての grid-item を走査
    document.querySelectorAll(".grid-item[data-app]").forEach(app => {

        const name = app.dataset.app;         // TouchApp / GemboApp / etc
        const baseUrl = `https://Tsu-App.com/App/${name}/`;

        const exeUrl = `${baseUrl}${name}_Setup.exe`;
        const xmlUrl = `${baseUrl}Version.xml`;

        const versionEl = app.querySelector(".version");
        const dateEl    = app.querySelector(".lastModified");
        const sizeEl    = app.querySelector(".fileSize");

        loadVersionInfo(exeUrl, xmlUrl, versionEl, dateEl, sizeEl);
    });
});


//----------------------------------------------------------
// 1アプリ分の情報を読み取って HTML に反映する
//----------------------------------------------------------
async function loadVersionInfo(exeUrl, xmlUrl, versionEl, dateEl, sizeEl) {
    try {
        // EXE の HTTP Header（最終更新日・サイズ）
        const head = await fetch(exeUrl, { method: "HEAD" });
        if (!head.ok) throw new Error("HEAD 取得失敗");

        const lastModified = head.headers.get("Last-Modified");
        const contentLength = head.headers.get("Content-Length");

        // Version.xml の読み込み（キャッシュ対策で ?t=NOW）
        const xmlText = await fetch(`${xmlUrl}?t=${Date.now()}`).then(r => r.text());
        const xml = new DOMParser().parseFromString(xmlText, "application/xml");
        const version = xml.querySelector("version")?.textContent ?? "不明";

        // HTML 表示
        versionEl.textContent = version;

        dateEl.textContent = lastModified
            ? new Date(lastModified).toLocaleDateString("ja-JP")
            : "不明";

        sizeEl.textContent = contentLength
            ? `${(contentLength / 1024 / 1024).toFixed(2)} MB`
            : "不明";

    } catch (err) {
        if (versionEl) versionEl.textContent = "取得エラー";
        if (dateEl)    dateEl.textContent    = "取得エラー";
        if (sizeEl)    sizeEl.textContent    = "取得エラー";

        console.error("バージョン情報取得エラー:", err);
    }
}
