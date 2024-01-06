export function createTable16x16() {
    let table = document.createElement("table")
    table.id = "table"

    // Create header row
    let tr = document.createElement("tr")
    for (let i = 0; i < 16; i++) {
        let th = document.createElement("th")
        th.innerText = `${i + 1}`
        tr.appendChild(th)
    }
    table.appendChild(tr)

    // Create 16 rows with 16 columns each
    for (let i = 0; i < 16; i++) {
        tr = document.createElement("tr")
        for (let j = 0; j < 16; j++) {
            let td = document.createElement("td")
            td.style.height = "75"
            td.style.width = "75"
            td.innerText = `${i},${j}`
            td.id = `td-${i}-${j}`
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }

    document.body.appendChild(table)
}
