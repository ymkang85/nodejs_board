$(function () {
    $("#del").click(function () {
        const delpass = $("#password_del").val();
        const delnum = $("#delnum").val();
        $.ajax({
            url: '/del',
            type: 'post',
            data: { delpass: delpass, delnum: delnum },
            success: function (data) {
                const rs = parseInt(data);
                if (rs > 0) {
                    alert("삭제했습니다.");
                    location.href = "/";
                } else {
                    alert("비밀번호를 다시 확인하세요.");
                    $("#password_del").val('');
                    $("#password_del").focus();
                }
            },
            error: function (xhr) {
                alert("삭제를 하는데 에러가 발생했습니다. \n 다시 시도하거나 운영자에게 문의하십시오.");
            }
        });
    });

    $("#del_comment").click(function () {
        const delpass = $("#passwordcomm_del").val();
        const delcommnum = $("#delcommnum").val();
        $.ajax({
            url: '/del_comment',
            type: 'post',
            data: { delpass: delpass, delcommnum: delcommnum },
            success: function (data) {
                const rs = parseInt(data);
                console.dir(rs);
                if (rs > 0) {
                    alert("삭제했습니다.");
                    location.href = "/";
                } else {
                    alert("비밀번호를 다시 확인하세요.");
                    $("#password_del").val('');
                    $("#password_del").focus();
                }
            },
            error: function (xhr) {
                alert("삭제를 하는데 에러가 발생했습니다. \n 다시 시도하거나 운영자에게 문의하십시오.");
            }
        });
    }
    )
});