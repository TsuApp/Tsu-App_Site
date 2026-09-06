// app.js : GitHub Releases と Version.xml から各アプリ情報を取得する

const GITHUB_OWNER = "TsuApp";
const GITHUB_REPO = "Tsu-App_Site";

document.addEventListener("DOMContentLoaded", async () => {

    try {
        // GitHub Releases一覧を1回だけ取得
        const releasesUrl =
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=100`;

        const response = await fetch(releasesUrl);

        if (!response.ok) {
            throw new Error("GitHub Releases の取得に失敗しました");
        }

        const releases = await response.json();

        // 各アプリカードを処理
        document.querySelectorAll(".grid-item[data-app]").forEach(app => {
            loadAppInfo(app, releases);
        });

    } catch (err) {
        console.error("GitHub Releases取得エラー:", err);
    }
});


//----------------------------------------------------------
// 1アプリ分の情報を取得して表示
//----------------------------------------------------------
async function loadAppInfo(app, releases) {

    const name = app.dataset.app;

    const versionEl = app.querySelector(".version");
    const dateEl    = app.querySelector(".lastModified");
    const sizeEl    = app.querySelector(".fileSize");

    try {
        //--------------------------------------------------
        // Version.xml からバージョン取得
        //--------------------------------------------------
        const xmlUrl = `${name}/Version.xml?t=${Date.now()}`;

        const xmlResponse = await fetch(xmlUrl);

        if (!xmlResponse.ok) {
            throw new Error(`${name}: Version.xml取得失敗`);
        }

        const xmlText = await xmlResponse.text();
        const xml = new DOMParser().parseFromString(
            xmlText,
            "application/xml"
        );

        const version =
            xml.querySelector("version")?.textContent ?? "不明";

        //--------------------------------------------------
        // GitHub Releaseを探す
        //--------------------------------------------------
        const tagName = `${name}-latest`;

        const release = releases.find(
            r => r.tag_name === tagName
        );

        if (!release) {
            throw new Error(`${name}: Releaseがありません`);
        }

        //--------------------------------------------------
        // Setup.exeを探す
        //--------------------------------------------------
        const setupName = `${name}_Setup.exe`;

        const asset = release.assets.find(
            a => a.name === setupName
        );

        if (!asset) {
            throw new Error(`${name}: ${setupName} がありません`);
        }

        //--------------------------------------------------
        // 表示
        //--------------------------------------------------
        versionEl.textContent = version;

        dateEl.textContent =
            new Date(asset.updated_at).toLocaleDateString("ja-JP");

        sizeEl.textContent =
            `${(asset.size / 1024 / 1024).toFixed(2)} MB`;

        //--------------------------------------------------
        // ダウンロードリンクもGitHub Releasesへ自動設定
        //--------------------------------------------------
        app.querySelectorAll('a[href*="_Setup.exe"]').forEach(link => {
            link.href = asset.browser_download_url;
        });

    } catch (err) {

        if (versionEl) versionEl.textContent = "取得エラー";
        if (dateEl)    dateEl.textContent    = "取得エラー";
        if (sizeEl)    sizeEl.textContent    = "取得エラー";

        console.error(err);
    }
}
