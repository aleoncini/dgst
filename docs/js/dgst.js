var STORE_ORIGIN = window.location.origin;
var nFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 0});
var dFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 2});

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

    localStorage.setItem('dgstDataSetSize', 0);
    localStorage.setItem('dgstNumberOfDays', 1);
    localStorage.setItem('dgstNumberOfInstances', 3);
    localStorage.setItem('dgstContainerMemory', 2);

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
    $("#dataSetSize").html(nFormat.format(singleDaySize));

    var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
    $("#days").val(days);

    var instances = JSON.parse(localStorage.getItem("dgstNumberOfInstances") || "3");
    $("#instances").val(instances);

    var memory = JSON.parse(localStorage.getItem("dgstContainerMemory") || "2");
    $("#ram").val(memory);

    var clSize = singleDaySize * days;
    $("#clusterSize").html(nFormat.format(clSize));

    var instMemory = clSize / instances;
    $("#inst_mem").html(nFormat.format(instMemory));

    var diff = (instMemory * 2) - parseInt($('#ram').val()) * 1024 * 1024 *1024;
    if(diff > 0){
        $("#overload").html('<p style=\"color: #ff7b25\">' + nFormat.format(diff) + '</p>');
    } else {
        $("#overload").html('<p style=\"color: #45b39d\">no overload</p>');
    }
};

function analyseChange() {
    var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
    var inputDays = parseInt($('#days').val());
    if(isNaN(inputDays) || (inputDays == 0)){
        inputDays = 1;
    }
    if( inputDays != days){
        days = inputDays;
        localStorage.setItem('dgstNumberOfDays', days);
    }

    var instances = JSON.parse(localStorage.getItem("dgstNumberOfInstances") || "3");
    var inputInstances = parseInt($('#instances').val());
    if(isNaN(inputInstances) || (inputInstances == 0)){
        inputDays = 3;
    }
    if( inputInstances != instances){
        instances = inputInstances;
        localStorage.setItem('dgstNumberOfInstances', instances);
    }

    var memory = JSON.parse(localStorage.getItem("dgstContainerMemory") || "2");
    if( $("#ram").val() != memory){
        memory = $("#ram").val();
        localStorage.setItem('dgstContainerMemory', memory);
    }
    analyse();
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
    //rowContent += '<td class=\"text-end\"><div class=\"input-group input-group-sm\"><span class=\"input-group-text\">Size in Mil.</span><input type=\"text\" class=\"form-control input_max_count\" value=\"' + cache.maxcount + '\"></div></td>';
    rowContent += '<td class=\"text-end\"><input data-id=\"' + cache.name + '\" type=\"text\" class=\"form-control input_max_count text-end\" value=\"' + cache.maxcount + '\"></td>';

    if(cache.maxcount == 0){
        var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
        var dss = nFormat.format((cache.entrySize + cache.keySize) * cache.entries * days * (cache.owners + 1));
        rowContent += '<td id=\"dss_' + cache.name + '\" class=\"text-end\">' + dss + '</td>';
        rowContent += '<td id=\"dim_' + cache.name + '\" class=\"text-end\">0</td>';
    } else {
        var dss = nFormat.format((cache.entrySize + cache.keySize) * cache.maxcount * (cache.owners + 1));
        rowContent += '<td id=\"dss_' + cache.name + '\" class=\"text-end\">' + dss + '</td>';
        var dim = dFormat.format(cache.maxcount / cache.entries);
        rowContent += '<td id=\"dim_' + cache.name + '\" class=\"text-end\">' + dim + '</td>';
    }
    rowContent += '</tr>';
    $('#tbl_caches  tbody').append(rowContent);
    calculateClusterSizeByMaxCount();
};

function calculateEvictions(cacheName, maxcount) {
    var caches = JSON.parse(localStorage.getItem("dgstCaches") || "[]");
    $.each(caches, function (index, cache) {
        if(cache.name == cacheName){
            var dss = nFormat.format((cache.entrySize + cache.keySize) * maxcount * (cache.owners + 1));
            $("#dss_" + cache.name).html(dss);
            cache.maxcount = maxcount;
            var dim = dFormat.format(maxcount / cache.entries);
            $("#dim_" + cache.name).html(dim);
        }
    });
    localStorage.setItem('dgstCaches', JSON.stringify(caches));
};

function calculateClusterSizeByMaxCount() {
    var caches = JSON.parse(localStorage.getItem("dgstCaches") || "[]");
    var days = JSON.parse(localStorage.getItem("dgstNumberOfDays") || "1");
    var instances = localStorage.getItem('dgstNumberOfInstances') || 3;
    var containerMemory = localStorage.getItem('dgstContainerMemory') || 2;
    var clusterSize = 0;
    $.each(caches, function (index, cache) {
        if(cache.maxcount == 0){
            clusterSize += (cache.entrySize + cache.keySize) * cache.entries * days * (cache.owners + 1);
        } else {
            clusterSize += (cache.entrySize + cache.keySize) * cache.maxcount * (cache.owners + 1);
        }
    });
    var containerSize = parseInt(containerMemory) * 1024 * 1024 * 1024;
    $("#totalMemorySize").html(nFormat.format(clusterSize));
    var containerMemoryRequested = clusterSize / instances;
    $("#containerMemorySize").html(nFormat.format(containerMemoryRequested));
    var diff = containerSize - containerMemoryRequested;
    if(diff > 0){
        $("#status").html('<p style=\"color: #45b39d\">Healthy. Good setup</p>');
    } else {
        $("#status").html('<p style=\"color: #ff7b25\">Risk of buffer overflow !!</p>');
    }

};