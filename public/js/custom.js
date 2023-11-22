$(function () {

    //modal 정보 넘기기
    $("delModal").on("show.bs.modal", function (e) {
        const button = (e.relatedTarget);
        const char = button.data("char");
        const delnum = button.data("delnum");
        $("#comment_delnum").val(delnum);
        $("#char").val(char);
    })

    //modal 정보 넘기기
    $("editModal").on("show.bs.modal", function (e) {
        const reg = /<[^>]*>?/g;
        const button = (e.relatedTarget);
        const edtnum = button.data("edtnum");
        let contents = $("#comment_" + edtnum).val().replace(reg, "");
        $("#memo_comment").val(contents);
    });

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

    $('#edit').click(function () {
        const comment = $('#memo_comment').val();
        const password = $('#password_edt').val();
        const comment_edtnum = $('#comment_edtnum').val();
        if (password == '') {
            alert("비밀번호를 입력하세요.");
            $('#password_edt').focus();
            return;
        }
        $.ajax({
            url: "/comment_edt",
            type: "post",
            data: { comment, password, comment_edtnum },
            success: function (data) {
                const rs = parseInt(data);
                if (rs > 0) {
                    alert("수정했습니다.");
                    location.replace();
                } else {
                    alert("비밀번호를 다시 확인하세요.");
                    $("#password_edt").val('');
                    $("#password_edt").focus();
                }
            },
            error: function (xhr) {
                alert("수정하는데 에러가 발생했습니다.");
                $("#password_edt").val('');
                $("#password_edt").focus();
            }
        })
    })
});