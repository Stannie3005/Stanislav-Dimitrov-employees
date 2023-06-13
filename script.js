function findPair(employees) {
    console.log(employees);
}

const uploadconfirm = document.getElementById("uploadconfirm").
addEventListener("click", () => {
    Papa.parse(document.getElementById("uploadfile").files[0],
    {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            findPair(results)
        }
    });
});