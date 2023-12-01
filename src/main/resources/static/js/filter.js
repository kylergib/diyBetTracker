import {
    apiRequest,
    baseUrl,
    checkSession,
    formatDateOnly,
    getCurrentDateTimeString,
    getCurrentUser,
    getDateString,
    getStartAndEndOfMonth,
    getStartAndEndOfWeek,
} from "./util.js";

let todaysDate = new Date();
export let betFilterStatus = "day";
export let startFilter = new Date();
export let endFilter = new Date();
export let previousRequestPending = false;

// setBetFilterText(formatDateOnly(startFilter));

export function setPendingRequest(value) {
    previousRequestPending = value;

    const itemList = [
        document.getElementById("dayListItem"),
        document.getElementById("weekListItem"),
        document.getElementById("monthListItem"),
    ];
    if (betFilterStatus !== "custom" && betFilterStatus !== "total") {
        itemList.push(document.getElementById("previousListItem"));
        itemList.push(document.getElementById("nextListItem"));
    }

    if (value == true) {
        itemList.forEach((item) => {
            item.classList.add("disabled");
        });
    } else {
        itemList.forEach((item) => {
            item.classList.remove("disabled");
        });
    }
}
export function setBetFilterText(text) {
    document.getElementById("currentDateFilter").textContent = text;
}
export function initializeDateFilter(additionalFunc = null) {
    setBetFilterText(formatDateOnly(startFilter));
    if (additionalFunc != null) additionalFunc(getDateString(startFilter), getDateString(startFilter));
    $(function () {
        $('a[id="currentDateFilter"]').daterangepicker(
            {
                opens: "left",
            },
            async function (start, end, label) {
                setPendingRequest(true);
                let text;
                let filterStatus;

                startFilter = new Date(start);
                endFilter = new Date(end);
                let endDate = null;
                if (start.format("YYYY-MM-DD") == end.format("YYYY-MM-DD")) {
                    text = `${formatDateOnly(startFilter)}`;
                    filterStatus = "day";
                    // set filter to day
                } else {
                    text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
                    endDate = getDateString(endFilter);
                    filterStatus = "custom";
                }

                changeFilterStatus(filterStatus);
                setBetFilterText(text);
                if (additionalFunc != null) additionalFunc(getDateString(startFilter), getDateString(endFilter));
                // clearTable();
                // sortBetsAndAdd(
                //     await getAllUserBetsDate(getDateString(startFilter), endDate)
                // );
                setPendingRequest(false);
            }
        );
    });
}
export function setFilterListeners() {


    document.getElementById("previousFilter").addEventListener(
        "click",
        async () => {
            console.log("previous clicked");
            setPendingRequest(true);
            await changeFilter(-1);
            setPendingRequest(false);
        },
        false
    );

    document.getElementById("nextFilter").addEventListener(
        "click",
        async () => {
            console.log("next clicked");
            setPendingRequest(true);

            await changeFilter(1);
            setPendingRequest(false);
        },
        false
    );

    document.getElementById("dayFilter").addEventListener(
        "click",
        async () => {
            console.log("day clicked");
            if (betFilterStatus !== "day" && previousRequestPending == false) {
                setPendingRequest(true);
                changeFilterStatus("day");
                endFilter = new Date(startFilter);
                setBetFilterText(formatDateOnly(startFilter));
                // clearTable();
                // sortBetsAndAdd(await getAllUserBetsDate(getDateString(startFilter)));
                setPendingRequest(false);
            }
        },
        false
    );

    document.getElementById("weekFilter").addEventListener(
        "click",
        async () => {
            console.log("week clicked");
            if (betFilterStatus !== "week" && previousRequestPending == false) {
                setPendingRequest(true);
                changeFilterStatus("week");
                const startAndEnd = getStartAndEndOfWeek(startFilter);
                startFilter = new Date(startAndEnd.startOfWeek);
                endFilter = new Date(startAndEnd.endOfWeek);
                setBetFilterText(
                    `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
                );
                // clearTable();
                // sortBetsAndAdd(
                //     await getAllUserBetsDate(
                //         getDateString(startFilter),
                //         getDateString(endFilter)
                //     )
                // );
                setPendingRequest(false);
            }
        },
        false
    );
    document.getElementById("monthFilter").addEventListener(
        "click",
        async () => {
            console.log("month clicked");

            if (betFilterStatus !== "month") {
                setPendingRequest(true);
                changeFilterStatus("month");
                const startAndEnd = getStartAndEndOfMonth(startFilter);
                startFilter = new Date(startAndEnd.startOfMonth);
                endFilter = new Date(startAndEnd.endOfMonth);
                setBetFilterText(
                    `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
                );
                // clearTable();
                // sortBetsAndAdd(
                //     await getAllUserBetsDate(
                //         getDateString(startFilter),
                //         getDateString(endFilter)
                //     )
                // );
                setPendingRequest(false);
            }
        },
        false
    );
}

export function changeFilterStatus(filter) {
    const dayItem = document.getElementById("dayListItem");
    const weekItem = document.getElementById("weekListItem");
    const monthItem = document.getElementById("monthListItem");
    const totalItem = document.getElementById("totalListItem");
    const previousItem = document.getElementById("previousListItem");
    const nextItem = document.getElementById("nextListItem");
    if (filter === "day") {
        dayItem.classList.add("active");
        weekItem.classList.remove("active");
        monthItem.classList.remove("active");
        totalItem.classList.remove("active");
        previousItem.classList.remove("disabled");
        nextItem.classList.remove("disabled");
        betFilterStatus = "day";
    } else if (filter === "week") {
        dayItem.classList.remove("active");
        weekItem.classList.add("active");
        monthItem.classList.remove("active");
        totalItem.classList.remove("active");
        previousItem.classList.remove("disabled");
        nextItem.classList.remove("disabled");
        betFilterStatus = "week";
    } else if (filter === "month") {
        dayItem.classList.remove("active");
        weekItem.classList.remove("active");
        monthItem.classList.add("active");
        totalItem.classList.remove("active");
        previousItem.classList.remove("disabled");
        nextItem.classList.remove("disabled");
        betFilterStatus = "month";
    } else if (filter === "custom") {
        dayItem.classList.remove("active");
        weekItem.classList.remove("active");
        monthItem.classList.remove("active");
        totalItem.classList.remove("active");
        previousItem.classList.add("disabled");
        nextItem.classList.add("disabled");
        betFilterStatus = filter;
    } else if (filter === "total") {
        dayItem.classList.remove("active");
        weekItem.classList.remove("active");
        monthItem.classList.remove("active");
        totalItem.classList.add("active");
        previousItem.classList.add("disabled");
        nextItem.classList.add("disabled");
        betFilterStatus = "total";
    }
}

export async function changeFilter(changeAmount, additionalFunc = null) {
    let text;
    let startDate;
    let endDate;
    if (betFilterStatus === "day") {
        startFilter.setDate(startFilter.getDate() + changeAmount);
        endFilter.setDate(endFilter.getDate() + changeAmount);
        text = formatDateOnly(startFilter);

        endDate = null;
    } else if (betFilterStatus === "week") {
        changeAmount *= 7;
        startFilter.setDate(startFilter.getDate() + changeAmount);
        endFilter.setDate(endFilter.getDate() + changeAmount);
        text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
        endDate = getDateString(endFilter);
    } else if (betFilterStatus === "month") {
        startFilter.setMonth(startFilter.getMonth() + changeAmount);
        endFilter = new Date(
            startFilter.getFullYear(),
            startFilter.getMonth() + 1,
            0
        );

        text = `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`;
        endDate = getDateString(endFilter);
    }
    startDate = getDateString(startFilter);
    setBetFilterText(text);
    if (additionalFunc != null) {
        additionalFunc(getDateString(startFilter), getDateString(endFilter));
    }
    // clearTable();
    // sortBetsAndAdd(await getAllUserBetsDate(startDate, endDate));
}

export function getStartAndEnd() {
    return {"filterStatus": betFilterStatus,"start": getDateString(startFilter), "end": getDateString(endFilter)};
}

export function setMonthFiilter(additionalFunc = null) {
    console.log("month clicked");
    if (betFilterStatus !== "month") {
        setPendingRequest(true);
        changeFilterStatus("month");
        const startAndEnd = getStartAndEndOfMonth(startFilter);
        startFilter = new Date(startAndEnd.startOfMonth);
        endFilter = new Date(startAndEnd.endOfMonth);
        setBetFilterText(
            `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
        );
        if (additionalFunc != null) {
            additionalFunc(getDateString(startFilter), getDateString(endFilter));
        }
        // clearTable();
        // sortBetsAndAdd(
        //     await getAllUserBetsDate(
        //         getDateString(startFilter),
        //         getDateString(endFilter)
        //     )
        // );
        setPendingRequest(false);
    }
}
export function setWeekFilter(additionalFunc = null) {
    console.log("week clicked");
    if (betFilterStatus !== "week" && previousRequestPending == false) {
        setPendingRequest(true);
        changeFilterStatus("week");
        const startAndEnd = getStartAndEndOfWeek(startFilter);
        startFilter = new Date(startAndEnd.startOfWeek);
        endFilter = new Date(startAndEnd.endOfWeek);
        setBetFilterText(
            `${formatDateOnly(startFilter)} - ${formatDateOnly(endFilter)}`
        );
        if (additionalFunc != null) {
            additionalFunc(getDateString(startFilter), getDateString(endFilter));
        }
        // clearTable();
        // sortBetsAndAdd(
        //     await getAllUserBetsDate(
        //         getDateString(startFilter),
        //         getDateString(endFilter)
        //     )
        // );
        setPendingRequest(false);
    }
}
export function setDayFilter(additionalFunc = null) {
    console.log("day clicked");
    if (betFilterStatus !== "day" && previousRequestPending == false) {
        setPendingRequest(true);
        changeFilterStatus("day");
        endFilter = new Date(startFilter);
        setBetFilterText(formatDateOnly(startFilter));
        if (additionalFunc != null) {
            additionalFunc(getDateString(startFilter), getDateString(endFilter));
        }
        // clearTable();
        // sortBetsAndAdd(await getAllUserBetsDate(getDateString(startFilter)));
        setPendingRequest(false);
    }
}
export function setTotalFilter(additionalFunc = null) {
    console.log("total clicked");
    if (betFilterStatus !== "total" && previousRequestPending == false) {
        setPendingRequest(true);
        setBetFilterText("Total");
        changeFilterStatus("total");
        // setTotalButtons();
        endFilter = new Date(startFilter);

        if (additionalFunc != null) {
            additionalFunc();
        }
        // clearTable();
        // sortBetsAndAdd(await getAllUserBetsDate(getDateString(startFilter)));
        setPendingRequest(false);
    }
}