// =========================================
// CSV モーダル表示（美しいテーブル付き）
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("modal");const closeBtn = document.getElementById("modalCloseBtn");
    const container = document.getElementById("csvContainer");

    // CSVボタン押下時
    document.querySelectorAll(".csv-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const csvPath = btn.dataset.csv;

            try {
                const res = await fetch(csvPath);
                if (!res.ok) throw new Error("CSV取得失敗：" + res.status);

                const text = await res.text();
                const rows = text.trim().split("\n").map(r => r.split(","));

                container.innerHTML = buildTable(rows);

                overlay.style.display = "flex";

            } catch (err) {
                container.innerHTML = `<p style="color:red;">CSV読み込みエラー: ${err}</p>`;
                overlay.style.display = "flex";
            }
        });
    });

    // 閉じる
    closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        container.innerHTML = "";
    });

});

// テーブルHTML組み立て
function buildTable(rows) {
    let html = "<table><thead><tr>";

    // ヘッダ行
    rows[0].forEach(h => {
        html += `<th>${escapeHtml(h)}</th>`;
    });

    html += "</tr></thead><tbody>";

    // データ行
    rows.slice(1).forEach(row => {
        html += "<tr>";
        row.forEach(col => {
            html += `<td>${escapeHtml(col)}</td>`;
        });
        html += "</tr>";
    });

    html += "</tbody></table>";

    return html;
}

// HTMLエスケープ
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
