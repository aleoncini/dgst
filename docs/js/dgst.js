var STORE_ORIGIN = window.location.origin;
var nFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 0});

function displayCaches() {
    $('#current_report').hide();
    $("#cachesTableBody").empty();

    // check if an array of trips is locally saved
    var caches = JSON.parse(localStorage.getItem("dgstCaches") || "[]");

    $.each(caches, function (index, cache) {
        addCacheToTable(cache, index)
    });

    $('#current_report').show(500);
};

function addCacheToTable(cache, ndx) {
    var rowContent = '<tr>';
    rowContent += '<td>' + cache.name + '</td>';
    rowContent += '<td class=\"text-end\">' + cache.entrySize + '</td>';
    rowContent += '<td class=\"text-end\">' + cache.keySize + '</td>';
    rowContent += '<td class=\"text-end\">' + nFormat.format(cache.entries) + '</td>';
    rowContent += '<td class=\"text-end\">' + cache.owners + '</td>';
    rowContent += '<td style="cursor: pointer;" class="delete_cache text-end" data-id="' + ndx + '"><img src="img/trash.svg" alt="delete" width="24" height="24"></td>';
    rowContent += '</tr>';
    $('#tbl_caches  tbody').append(rowContent);
};

function setAlert(msg) {
    $("#formNotComplete").html(msg);
    $("#formNotComplete").fadeIn();
    window.setTimeout(function() {
        $("#formNotComplete").fadeOut();
    }, 3000);
};

function resetReport() {
    var caches = [];
    localStorage.setItem('dgstCaches', JSON.stringify(caches));
    displayCaches();
};

function setDataSetSize(caches) {
    var singleDaySize = 0;
    $.each(caches, function (index, cache) {
        singleDaySize += ((cache.entrySize + cache.keySize) * cache.entries * (cache.owners + 1));
    });
    localStorage.setItem('dgstDataSetSize', JSON.stringify(singleDaySize));
};

function analyse() {
    var singleDaySize = JSON.parse(localStorage.getItem("dgstDataSetSize") || "0");
    var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
    var instances = JSON.parse(localStorage.getItem("dgstNumberOfInstances") || "3");
    var memory = JSON.parse(localStorage.getItem("dgstContainerMemory") || "2");
    $("#dataSetSize").html(nFormat.format(singleDaySize));
    $("#days").val(nFormat.format(days));
    var clSize = singleDaySize * days;
    $("#clusterSize").html(nFormat.format(clSize));
    $("#instances").html(nFormat.format(instances));
    var instMemory = clSize / instances;
    $("#inst_mem").html(nFormat.format(instMemory));
    $("div.ram select").val(memory).change();
    var diff = (instMemory * 2) - parseInt($('#ram').val()) * 1024 * 1024 *1024;
    if(diff > 0){
        $("#overload").html('<p style=\"color: #ff7b25\">' + nFormat.format(diff) + '</p>');
    } else {
        $("#overload").html('<p style=\"color: #45b39d\">no overload</p>');
    }
};

function analyseChange() {
    var singleDaySize = JSON.parse(localStorage.getItem("dgstDataSetSize") || "0");
    var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
    if( $("#days").val() != days){
        days = $("#days").val();
        localStorage.setItem('dgstNumberOfDays', JSON.stringify($("#days").val()));
        $("#clusterSize").html(nFormat.format(singleDaySize * days));
        $("#inst_mem").html(nFormat.format((singleDaySize * days) / $("#instances").val()));
        var diff = ((singleDaySize * days) / $("#instances").val() * 2) - parseInt($('#ram').val()) * 1024 * 1024 *1024;
        if(diff > 0){
            $("#overload").html('<p style=\"color: #ff7b25\">' + nFormat.format(diff) + '</p>');
        } else {
            $("#overload").html('<p style=\"color: #45b39d\">no overload</p>');
        }
    }
};

function displayEviction() {
    $('#current_report').hide();
    $("#cachesTableBody").empty();

    // check if an array of trips is locally saved
    var caches = JSON.parse(localStorage.getItem("dgstCaches") || "[]");
    var singleDaySize = JSON.parse(localStorage.getItem("dgstDataSetSize") || "0");

    $.each(caches, function (index, cache) {
        addCacheCountToTable(cache, index)
    });

    $('#current_report').show(500);
};

function addCacheCountToTable(cache, ndx) {
    var rowContent = '<tr>';
    rowContent += '<td>' + cache.name + '</td>';
    rowContent += '<td class=\"text-end\">' + nFormat.format(cache.entries) + '</td>';
    rowContent += '<td class=\"text-end\"><div class=\"input-group input-group-sm\"><span class=\"input-group-text\">Size in Mil.</span><input type=\"text\" class=\"form-control input_max_count\" value=\"' + cache.maxcount + '\"></div></td>';

    rowContent += '<td id=\"dss_' + cache.name + '\" class=\"text-end\">' + cache.owners + '</td>';
    rowContent += '<td id=\"dim_' + cache.name + '\" class=\"text-end\">' + cache.owners + '</td>';
    rowContent += '</tr>';
    $('#tbl_caches  tbody').append(rowContent);
};

