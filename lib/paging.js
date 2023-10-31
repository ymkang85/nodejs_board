/*
   listSize : 한 화면에 보여줄 목록 크기
   pageSize : 한 화면에 보여줄 페이지 수 
   totalCount : 전체 게시글 수
   currentPage : 현재 페이지 번호
   totalPage : 전체 페이지 수
   startPage : 시작 페이지
   endPage : 마지막 페이지
   preStart : 이전 페이지
   nextStart : 다음 페이지

*/

function getPaging(lSize, pSize, tCount, page, link) {
   const listSize = parseInt(lSize);
   const pageSize = parseInt(pSize);
   const totalCount = parseInt(tCount);
   const currentPage = parseInt(page);
   let li = '<a href="/" class="btn btn-secondary mr-4">목록</a>', preStart, nextStart;
   if (totalCount > listSize) {
      // 전체 페이지 수를 구함
      let totalPage = Math.ceil(totalCount / listSize);

      // 시작페이지 = floor(현재 페이지 / 페이징개수) * 페이징개수 + 1;
      const startPage = (Math.floor((currentPage - 1) / pageSize)) * pageSize + 1;

      // 마지막 페이지
      let endPage = startPage + pageSize - 1;
      if (endPage > totalPage) endPage = totalPage;

      // 처음 페이지 이동
      li += `<li class = "page-item"><a href="${link}?page=1" class="page-link">처음</a></li>`;

      // 이전 페이지 이동
      if(startPage + 1 >= pageSize){
         preStart = (startPage - pageSize);
         li += `<li class = "page-item"><a href="${link}?page=${preStart}" class="page-link">이전</a></li>`;
      }

      // 페이지 출력
      for(i = startPage ; i <= endPage ; i++){
         if(currentPage == i){
            li += `<li class="page-item" active><a href="${link}?page=${i}" class="page-link">${i}</a></li>`;
         }else{
            li += `<li class="page-item"><a href="${link}?page=${i}" class="page-link">${i}</a></li>`;
         }
      }

      // 다음 페이지 이동
      if(endPage < totalPage){
         nextStart = endPage + 1 ; 
         li += `<li class = "page-item"><a href="${link}?page=${nextStart}" class="page-link">다음</a></li>`;
      }

      // 마지막 페이지 이동
      li += `<li class = "page-item"><a href="${link}?page=${totalPage}" class="page-link">마지막</a></li>`;
   }
   li += '<a href="/write" class="btn btn-secondary">글쓰기</a>'
   return li;
}