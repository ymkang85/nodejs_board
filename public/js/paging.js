function getPaging(lScale, pageScale, tCount, st, link){
    let li='', sPage, pg, npg, pp, np, preStart, nextStart, lastStart;
    let listScale = Number(lScale);
    let totalCount = Number(tCount);
    let start = Number(st) -1;

    if(totalCount > listScale) {
      sPage = Math.floor(start / (listScale * pageScale));
      pp = start - listScale;
      np = start + listScale;

      //처음으로 이동
      if(pp >= 0) {
         li += `<li class="page-item"><a href="${link}?page=1" class="page-link">처음</a></li>`; 
      }
   
      //이전페이지 이동 - pageScale만큼 앞으로 이동함
      if(start + 1 > listScale * pageScale){
         preStart = listScale * (sPage * pageScale - 1);
         li += `<li class="page-item"><a href="${link}?page=${preStart}" class="page-link">이전</a></li>`;
      }

      //pageScale만큼 게시물 출력
      for( i = 0; i < pageScale; i++){
         pg = (sPage * pageScale + i) * listScale;
         npg = sPage * pageScale + i + 1;
         if(pg != start) {
            li += `<li class="page-item active"><a href="${link}?page=${npg}" class="page-link">${npg}</a></li>`;
         }else{
            li += `<li>${npg}</li>`;
         }
      }

      //다음페이지 이동 -- pageScale 만큼 뒤로 이동
      if(totalCount > ((sPage + 1)*listScale*pageScale)){
         nextStart = (sPage + 1)*listScale*pageScale;
         li += `<li class="page-item"><a href="${link}?page=${nextStart}"class="page-link">다음</a></li>`;
      }

      //마지막 페이지
      if( np < totalCount ){
        lastStart = (Math.floor(totalCount/listScale))*listScale;
        li += `<li class="page-item"><a href="${link}?page=${lastStart}"class="page-link">마지막</a></li>`;        
      }

   }else{
       li = `<li class="page-item active"><a href="${link}?page=1" class="page-link">1</a>`;
   }
    return li;
 }  