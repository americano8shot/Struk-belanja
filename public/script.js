var items = [
    { name: '', price: 0, qty: 0 },
    { name: '', price: 0, qty: 0 }
];

var igLogoData = '';

function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setTxDate();
    renderItems();
    updatePreview();
}

function updateClock() {
    var now = new Date();
    document.getElementById('clockDisplay').textContent =
        now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
        ' \u00B7 ' + now.toLocaleTimeString('id-ID');
}

function setTxDate() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var h = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('txDate').value = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
}

function handleIGUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 2MB', 'fa-exclamation-triangle');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        igLogoData = e.target.result;
        document.getElementById('igFileName').value = file.name;
        document.getElementById('igThumb').src = igLogoData;
        document.getElementById('igThumb').classList.add('show');
        document.getElementById('igUploadBtn').classList.add('has-file');
        document.getElementById('igUploadBtn').innerHTML = '<i class="fas fa-check"></i> Ganti';
        updatePreview();
        showToast('Logo Instagram berhasil diupload', 'fa-check-circle');
    };
    reader.readAsDataURL(file);
}

function fmt(n) {
    return n.toLocaleString('id-ID');
}

function renderItems() {
    var c = document.getElementById('itemsContainer');
    c.innerHTML = '';
    items.forEach(function(item, i) {
        var row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML =
            '<input type="text" value="' + item.name + '" placeholder="Nama item" aria-label="Nama item ' + (i + 1) + '" oninput="updateItem(' + i + ',\'name\',this.value)">' +
            '<input type="number" value="' + item.price + '" placeholder="0" min="0" aria-label="Harga item ' + (i + 1) + '" oninput="updateItem(' + i + ',\'price\',+this.value)">' +
            '<input type="number" value="' + item.qty + '" placeholder="0" min="1" aria-label="Jumlah item ' + (i + 1) + '" oninput="updateItem(' + i + ',\'qty\',+this.value)">' +
            '<button class="btn-remove" onclick="removeItem(' + i + ')" title="Hapus item ' + (i + 1) + '" aria-label="Hapus item ' + (i + 1) + '"><i class="fas fa-times"></i></button>';
        c.appendChild(row);
    });
}

function updateItem(i, key, val) {
    items[i][key] = val;
    updatePreview();
}

function addItem() {
    items.push({ name: '', price: 0, qty: 1 });
    renderItems();
    updatePreview();
    var inputs = document.querySelectorAll('.item-row:last-child input');
    if (inputs[0]) inputs[0].focus();
}

function removeItem(i) {
    items.splice(i, 1);
    renderItems();
    updatePreview();
}

function calc() {
    var subtotal = 0;
    items.forEach(function(it) {
        var p = Math.max(0, it.price || 0);
        var q = Math.max(0, it.qty || 0);
        subtotal += p * q;
    });
    var cash = Math.max(0, +document.getElementById('cashPaid').value || 0);
    var change = cash - subtotal;
    return { subtotal: subtotal, cash: cash, change: change };
}

function getOrderLabel(type) {
    if (type === 'gofood') return 'GOFOOD';
    if (type === 'shopeefood') return 'SHOPEE FOOD';
    if (type === 'grabfood') return 'GRABFOOD';
    return '';
}

function updatePreview() {
    var data = calc();
    var subtotal = data.subtotal;
    var cash = data.cash;
    var change = data.change;
    var orderType = document.getElementById('orderType').value;

    document.getElementById('dispSubtotal').textContent = 'Rp ' + fmt(subtotal);
    document.getElementById('dispTotal').textContent = 'Rp ' + fmt(subtotal);
    document.getElementById('dispCash').textContent = 'Rp ' + fmt(cash);
    document.getElementById('dispChange').textContent = 'Rp ' + fmt(Math.max(0, change));
    document.getElementById('dispChange').style.color = change < 0 ? '#e94560' : '#fff';

    var storeName = document.getElementById('storeName').value || 'Toko';
    var storeSub = document.getElementById('storeSub').value || '';
    var storeAddr = document.getElementById('storeAddr').value || '';
    var storeTag = document.getElementById('storeTag').value || '';
    var storeIG = document.getElementById('storeIG').value || '';
    var txDate = document.getElementById('txDate').value || '';
    var wifiName = document.getElementById('wifiName').value || '';
    var wifiPass = document.getElementById('wifiPass').value || '';

    var orderHTML = '';
    var orderLabel = getOrderLabel(orderType);
    if (orderLabel) {
        orderHTML = '<div class="r-order-type type-' + orderType + '">[ ' + orderLabel + ' ]</div>';
    }

    var itemsHTML = '';
    if (items.length === 0) {
        itemsHTML = '<div class="r-empty">Belum ada item</div>';
    } else {
        items.forEach(function(it) {
            if (!it.name && !it.price) return;
            var p = Math.max(0, it.price || 0);
            var q = Math.max(0, it.qty || 0);
            itemsHTML +=
                '<div class="r-item">' +
                '<span class="r-item-name">' + (it.name || '-') + '</span>' +
                '<span class="r-item-price">' + fmt(p) + '</span>' +
                '<span class="r-item-qty">' + q + '</span>' +
                '</div>';
        });
    }

    var igImgHTML = '';
    if (igLogoData) {
        igImgHTML = '<img src="' + igLogoData + '" alt="Logo Instagram">';
    }

    var html = '';

    html += '<div class="r-header">';
    html += '<div class="r-brand">' + storeName + '</div>';
    if (storeSub) html += '<div class="r-sub">' + storeSub + '</div>';
    if (storeAddr) html += '<div class="r-addr">' + storeAddr + '</div>';
    html += '</div>';

    html += '<div class="r-date">' + txDate + '</div>';
    html += orderHTML;

    html += '<hr class="r-sep">';
    html += '<div class="r-col-head">';
    html += '<span class="r-col-name">Item</span>';
    html += '<span class="r-col-price">Harga</span>';
    html += '<span class="r-col-qty">Jml</span>';
    html += '</div>';
    html += itemsHTML;

    html += '<hr class="r-sep">';
    html += '<div class="r-total-row"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>';
    html += '<div class="r-total-row grand"><span>TOTAL</span><span>Rp ' + fmt(subtotal) + '</span></div>';

    html += '<hr class="r-sep">';
    html += '<div class="r-pay-row"><span>Tunai</span><span>' + fmt(cash) + '</span></div>';
    html += '<div class="r-pay-row r-change"><span>Kembalian</span><span>' + fmt(Math.max(0, change)) + '</span></div>';

    if (storeTag || storeIG) {
        html += '<div class="r-footer">';
        if (storeTag) html += '<div class="r-tagline">"' + storeTag + '"</div>';
        if (storeIG) html += '<div class="r-ig">' + igImgHTML + storeIG + '</div>';
        html += '<div class="r-thanks">Terima kasih sudah order ditempat kami</div>';
        html += '</div>';
    }

    if (wifiName) {
        html += '<div class="r-wifi">';
        html += '<div class="r-wifi-icon"><i class="fas fa-wifi"></i></div>';
        html += '<div class="r-wifi-label">Nama Wifi</div>';
        html += '<div class="r-wifi-name">' + wifiName + '</div>';
        if (wifiPass) {
            html += '<div class="r-wifi-pass-label">Password:</div>';
            html += '<div class="r-wifi-pass">' + wifiPass + '</div>';
        }
        html += '</div>';
    }

    document.getElementById('receiptPreview').innerHTML = html;
}

function printReceipt() {
    var data = calc();
    if (data.subtotal <= 0) {
        showToast('Tambahkan item terlebih dahulu', 'fa-exclamation-circle');
        return;
    }
    if (data.change < 0) {
        showToast('Uang bayar kurang!', 'fa-exclamation-triangle');
        return;
    }
    setTxDate();
    updatePreview();
    showToast('Mencetak struk...', 'fa-print');
    setTimeout(function() { window.print(); }, 300);
}

function resetAll() {
    items = [{ name: '', price: 0, qty: 1 }];
    document.getElementById('cashPaid').value = '';
    document.getElementById('orderType').value = 'offline';
    document.getElementById('wifiName').value = '';
    document.getElementById('wifiPass').value = '';
    igLogoData = '';
    document.getElementById('igFileInput').value = '';
    document.getElementById('igFileName').value = 'Belum dipilih';
    document.getElementById('igThumb').classList.remove('show');
    document.getElementById('igUploadBtn').classList.remove('has-file');
    document.getElementById('igUploadBtn').innerHTML = '<i class="fas fa-image"></i> Pilih Foto';
    renderItems();
    setTxDate();
    updatePreview();
    showToast('Form berhasil direset', 'fa-rotate-right');
}

function showToast(msg, icon) {
    icon = icon || 'fa-check-circle';
    var t = document.getElementById('toast');
    var m = document.getElementById('toastMsg');
    t.querySelector('i').className = 'fas ' + icon;
    m.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function() { t.classList.remove('show'); }, 2500);
}

init();
