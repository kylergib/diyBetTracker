import {
    getProfit,
    americanToPercent,
    getEV,
    percentToAmericanOdds, americanToDecimal, getKellySize
} from "./calculatorUtil.js";
function getOdds() {
    let totalPercent = 1;
    for (let i = 1; i < 10; i++) {
        let doc = document.getElementById("leg" + i);
        console.log(doc.value)
        if (doc.value != "" || doc.value != 0) {
            totalPercent *= americanToPercent(Number(doc.value));
        }
    }
    console.log(totalPercent)
    return percentToAmericanOdds(totalPercent*100);
}
for (let i = 1; i < 10; i++) {
    let doc = document.getElementById("leg" + i);
    doc.addEventListener("input", () => {
        runCalc();
    }, false)
}
document.getElementById("sportsbookOdds").addEventListener("input", () => {
    runCalc();
}, false)

function runCalc() {
    document.getElementById("totalCalc").value = Math.round(getOdds());
    setEVKelly();
    setCorrelation();
}

document.getElementById("expectedValueRadio").addEventListener("click", () => {
    document.getElementById("expectedValueFinal").style.display = "";
    document.getElementById("correlationFinal").style.display = "none";
    runCalc();
}, false)

document.getElementById("correlationRadio").addEventListener("click", () => {
    document.getElementById("expectedValueFinal").style.display = "none";
    document.getElementById("correlationFinal").style.display = "";
    runCalc();
}, false)


document.getElementById("calcButton").addEventListener("click", () => {
    // let loadingElement = document.getElementById("loadingIndicator");
    // loadingElement.style.display = "";
    // document.getElementById("expectedValueFinal").style.display = "none";
    // document.getElementById("correlationFinal").style.display = "none";
    //
    //
    // let checkedRadio = document.querySelector('input[name="inlineRadioOptions"]:checked');
    // let calcTitle = document.getElementById("calcTitle");
    // if (checkedRadio.value == "ev") {
    //     setEVKelly();
    //     document.getElementById("expectedValueFinal").style.display = "";
    //     document.getElementById("correlationFinal").style.display = "none";
    //
    // } else if (checkedRadio.value == "correlation") {
    //
    //     document.getElementById("expectedValueFinal").style.display = "none";
    //
    //     document.getElementById("correlationFinal").style.display = "";
    //
    // }
    //
    // loadingElement.style.display = "none";
    for (let i = 1; i < 10; i++) {
        let doc = document.getElementById("leg" + i);
        doc.value = "";
    }


}, false);

function setEVKelly() {
    let sportsbookOddsDiv = document.getElementById("sportsbookOdds");
    let sbOdds = Number(sportsbookOddsDiv.value);
    let fairOdds = Number(document.getElementById("totalCalc").value);
    if (sbOdds == 0 || fairOdds == 0) {
        document.getElementById("evTotal").value = "";
        document.getElementById("kellyTotal").value = "";
        return;
    }
    let percentOdds = americanToPercent(fairOdds);
    let decimalOdds = americanToDecimal(sbOdds);

    let kelly = getKellySize(decimalOdds, percentOdds);

    let profit = getProfit(sbOdds);
    let ev = getEV(percentOdds, profit);

    document.getElementById("evTotal").value = ev.toFixed(2) + "%";
    document.getElementById("kellyTotal").value = (kelly * .33).toFixed(2) + "%"; // TODO: change to user option

}

function setCorrelation() {

    let sportsbookOddsDiv = document.getElementById("sportsbookOdds");
    let sbOdds = Number(sportsbookOddsDiv.value);
    let fairOdds = Number(document.getElementById("totalCalc").value);
    if (sbOdds == 0 || fairOdds == 0) {
        document.getElementById("correlationTotal").value = "";
        return;
    }
    let percentOdds = americanToPercent(fairOdds);

    let profit = getProfit(sbOdds);
    let ev = getEV(percentOdds, profit) * -1;

    document.getElementById("correlationTotal").value = ev.toFixed(2);

}