// التحقق من صلاحيات المستخدم
function checkPermission(permission) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }

    // المستخدم الرئيسي له كل الصلاحيات
    if (currentUser.username === 'admin') {
        return true;
    }

    // التحقق من وجود الصلاحية المطلوبة
    return currentUser.permissions && currentUser.permissions.includes(permission);
}

// التحقق من الصلاحية وتوجيه المستخدم إلى الصفحة الرئيسية إذا لم تكن لديه الصلاحية
function enforcePermission(permission) {
    if (!checkPermission(permission)) {
        alert('عذراً، ليس لديك صلاحية الوصول إلى هذه الصفحة');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
