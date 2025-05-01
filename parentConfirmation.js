// 단순화된 서명 및 저장 기능

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('간단한 서명 앱 초기화');
    
    // 오늘 날짜 설정
    setDefaultDates();
    
    // 결석 유형 선택 요소 추가
    addAbsenceTypeSelector();
    
    // 페이지 제목 및 레이블 텍스트 수정
    updatePageLabels();
    
    // 캔버스 요소
    const studentSigCanvas = document.getElementById('studentSignature');
    const guardianSigCanvas = document.getElementById('guardianSignature');
    const previewButton = document.getElementById('previewButton');
    const saveButton = document.getElementById('saveButton');
    const previewModal = document.getElementById('previewModal');
    const previewCanvas = document.getElementById('previewCanvas');
    const closeButton = document.querySelector('.close-button');
    const confirmSaveButton = document.getElementById('confirmSave');
    
    // 미리보기 확대/축소 관련 변수
    let scale = 1;
    let lastDistance = 0;
    let isZooming = false;
    let originalPreviewImage = null;
    
    // 캔버스 컨텍스트
    const studentCtx = studentSigCanvas ? studentSigCanvas.getContext('2d') : null;
    const guardianCtx = guardianSigCanvas ? guardianSigCanvas.getContext('2d') : null;
    
    console.log('캔버스 요소:', {
        studentSigCanvas,
        guardianSigCanvas,
        previewButton,
        saveButton,
        previewModal,
        previewCanvas
    });
    
    // 결석 유형 선택 요소 추가 함수
    function addAbsenceTypeSelector() {
        const reasonLabel = document.querySelector('label[for="reason"]');
        if (!reasonLabel) {
            console.error('사유 레이블을 찾을 수 없습니다');
            return;
        }

        // 결석 유형 선택기 컨테이너 생성
        const typeContainer = document.createElement('div');
        typeContainer.className = 'absence-type-container';
        typeContainer.style.marginBottom = '10px';

        // 레이블 생성 - '결석' 단어 제거
        const typeLabel = document.createElement('label');
        typeLabel.textContent = '유형:';
        typeLabel.style.fontWeight = 'bold';
        typeLabel.style.display = 'block';
        typeLabel.style.marginBottom = '5px';
        
        typeContainer.appendChild(typeLabel);

        // 유형 옵션들 - '불참'을 '결석'으로 변경
        const types = ['결석', '지각', '조퇴', '결과'];
        const typeOptions = document.createElement('div');
        typeOptions.className = 'absence-type-options';
        typeOptions.style.display = 'flex';
        typeOptions.style.gap = '10px';

        types.forEach(type => {
            const option = document.createElement('div');
            option.style.marginRight = '10px';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'absenceType';
            radio.id = `type-${type}`;
            radio.value = type;
            if (type === '결석') radio.checked = true; // 기본값 설정
            
            const optionLabel = document.createElement('label');
            optionLabel.htmlFor = `type-${type}`;
            optionLabel.textContent = type;
            
            option.appendChild(radio);
            option.appendChild(optionLabel);
            typeOptions.appendChild(option);
        });

        typeContainer.appendChild(typeOptions);
        
        // 사유 입력 필드 앞에 삽입
        reasonLabel.parentNode.insertBefore(typeContainer, reasonLabel);
        
        console.log('유형 선택기 추가 완료');
    }
    
    // 페이지 레이블 수정 함수
    function updatePageLabels() {
        // 페이지 제목 변경
        const pageTitle = document.querySelector('h1');
        if (pageTitle && pageTitle.textContent.includes('학생 결석 신청서')) {
            pageTitle.textContent = '학부모 확인서';
        }
        
        // '결석 기간' 레이블 변경
        const periodLabels = document.querySelectorAll('h2');
        periodLabels.forEach(label => {
            if (label.textContent.includes('결석 기간')) {
                label.textContent = '기간';
            }
        });
        
        // '결석 사유' 레이블 변경
        const reasonLabels = document.querySelectorAll('h2');
        reasonLabels.forEach(label => {
            if (label.textContent.includes('결석 사유')) {
                label.textContent = '사유';
            }
        });
        
        console.log('페이지 레이블 업데이트 완료');
    }
    
    // 서명 초기화
    if (studentCtx) {
        initCanvas(studentSigCanvas, studentCtx);
        
        // 지우기 버튼 연결
        const clearStudentBtn = document.getElementById('clearStudentSignature');
        if (clearStudentBtn) {
            clearStudentBtn.addEventListener('click', function() {
                clearCanvas(studentSigCanvas, studentCtx);
                console.log('학생 서명 지우기');
            });
        }
    }
    
    if (guardianCtx) {
        initCanvas(guardianSigCanvas, guardianCtx);
        
        // 지우기 버튼 연결
        const clearGuardianBtn = document.getElementById('clearGuardianSignature');
        if (clearGuardianBtn) {
            clearGuardianBtn.addEventListener('click', function() {
                clearCanvas(guardianSigCanvas, guardianCtx);
                console.log('보호자 서명 지우기');
            });
        }
    }
    
    // 미리보기 버튼 클릭 이벤트
    if (previewButton) {
        previewButton.addEventListener('click', function() {
            console.log('미리보기 버튼 클릭됨');
            
            // 폼 데이터 수집
            const formData = {
                studentInfo: {
                    grade: document.getElementById('grade').value,
                    classNum: document.getElementById('class').value,
                    number: document.getElementById('number').value,
                    name: document.getElementById('studentName').value
                },
                absencePeriod: {
                    startDate: formatDate(document.getElementById('startDate').value),
                    endDate: formatDate(document.getElementById('endDate').value)
                },
                absenceType: getSelectedAbsenceType(), // 선택된 결석 유형 가져오기
                reason: document.getElementById('reason').value,
                guardianName: document.getElementById('guardianName').value
            };
            
            console.log('수집된 폼 데이터:', formData);
            
            // 미리보기 생성
            generatePreview(formData);
            
            // 모달 표시
            if (previewModal) {
                previewModal.style.display = 'block';
                
                // 확대/축소 초기화
                scale = 1;
                setupZoom();
            }
        });
    }
    
    // 저장 버튼 클릭 이벤트
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            console.log('저장 버튼 클릭됨');
            
            // 폼 데이터 수집
            const formData = {
                studentInfo: {
                    grade: document.getElementById('grade').value,
                    classNum: document.getElementById('class').value,
                    number: document.getElementById('number').value,
                    name: document.getElementById('studentName').value
                },
                absencePeriod: {
                    startDate: formatDate(document.getElementById('startDate').value),
                    endDate: formatDate(document.getElementById('endDate').value)
                },
                absenceType: getSelectedAbsenceType(), // 선택된 결석 유형 가져오기
                reason: document.getElementById('reason').value,
                guardianName: document.getElementById('guardianName').value
            };
            
            // 미리보기 생성
            generatePreview(formData);
            
            // 직접 저장
            saveImage();
        });
    }
    
    // 모달 닫기 버튼
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            previewModal.style.display = 'none';
            // 확대/축소 상태 초기화
            scale = 1;
            originalPreviewImage = null;
        });
    }
    
    // 모달에서 저장 버튼
    if (confirmSaveButton) {
        confirmSaveButton.addEventListener('click', function() {
            saveImage();
            previewModal.style.display = 'none';
        });
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });
    
    // 캔버스 초기화 함수
    function initCanvas(canvas, ctx) {
        // 캔버스 배경 투명하게 설정
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 그리기 설정
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        let drawing = false;
        let lastX = 0;
        let lastY = 0;
        
        // 마우스 이벤트
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // 터치 이벤트
        canvas.addEventListener('touchstart', startTouchDrawing);
        canvas.addEventListener('touchmove', touchDraw);
        canvas.addEventListener('touchend', stopDrawing);
        
        function startDrawing(e) {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            console.log('그리기 시작:', lastX, lastY);
        }
        
        function draw(e) {
            if (!drawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            lastX = x;
            lastY = y;
        }
        
        function startTouchDrawing(e) {
            e.preventDefault();
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            lastX = touch.clientX - rect.left;
            lastY = touch.clientY - rect.top;
            console.log('터치 그리기 시작:', lastX, lastY);
        }
        
        function touchDraw(e) {
            if (!drawing) return;
            e.preventDefault();
            
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            lastX = x;
            lastY = y;
        }
        
        function stopDrawing() {
            drawing = false;
        }
    }
    
    // 캔버스 지우기 함수
    function clearCanvas(canvas, ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 서명을 이미지로 변환하는 함수
    function getSignatureImage(canvas) {
        return canvas.toDataURL('image/png');
    }
    
    // 날짜 포매팅
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${month}월 ${day}일`;
    }
    
    // 날짜 파싱 함수
    function parseDate(dateString) {
        if (!dateString) {
            const today = new Date();
            return {
                year: today.getFullYear(),
                month: today.getMonth() + 1,
                day: today.getDate(),
                dateObj: today
            };
        }
        
        const date = new Date(dateString);
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            dateObj: date
        };
    }
    
    // 기간 일수 계산 함수
    function calculateDays(startDate, endDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 시작일과 종료일 포함
        return diffDays;
    }
    
    // 텍스트 줄바꿈 함수
    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, x, y);
    }
    
    // 미리보기 생성
    function generatePreview(formData) {
        console.log('미리보기 생성 시작');
        
        if (!previewCanvas) {
            console.error('프리뷰 캔버스가 없습니다');
            return;
        }
        
        const ctx = previewCanvas.getContext('2d');
        
        // 확대/축소 상태 초기화
        scale = 1;
        originalPreviewImage = null;
        
        // 양식 이미지 로드
        const formImage = new Image();
        formImage.src = 'form.png';
        
        formImage.onload = function() {
            console.log('양식 이미지 로드 성공:', formImage.width, formImage.height);
            
            // 캔버스 크기 설정
            previewCanvas.width = formImage.width;
            previewCanvas.height = formImage.height;
            
            // 배경 이미지 그리기
            ctx.drawImage(formImage, 0, 0);
            
            // 텍스트 스타일 설정
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            
            // 1-3. 학생 정보 렌더링 - 학년, 반, 번호를 양식에 맞게 위치 조정
            const info = formData.studentInfo;
            
            // 학년 정보 - '학년' 글자 앞에 배치
            ctx.fillText(info.grade, 667, 280);
            
            // 반 정보 - '반' 글자 앞에 배치
            ctx.fillText(info.classNum, 736, 280);
            
            // 번호 정보 - '번호' 글자 앞에 배치
            ctx.fillText(info.number, 800, 280);
            
            // 학생 이름  
            ctx.fillText(info.name, 712, 316);
            
            // 4. 결석 기간 렌더링 - 괄호 안에 정보 배치
            const period = formData.absencePeriod;
            
            // 날짜 파싱
            const startDate = parseDate(document.getElementById('startDate').value);
            const endDate = parseDate(document.getElementById('endDate').value);
            
            // 시작일 월 입력
            ctx.fillText(startDate.month, 365, 383);
            
            // 시작일 일 입력
            ctx.fillText(startDate.day, 445, 383);
            
            // 종료일 월 입력
            ctx.fillText(endDate.month, 566, 383);
            
            // 종료일 일 입력
            ctx.fillText(endDate.day, 641, 383);
            
            // 기간 일수 계산
            const days = calculateDays(startDate.dateObj, endDate.dateObj);
            ctx.fillText(days, 758, 383);
            
            // 결석 유형에 동그라미 표시
            drawCircleAroundType(ctx, formData.absenceType);
            
            // 5. 사유 렌더링 - 사유 글자 아래에 줄바꿈으로 배치
            // 포맷팅을 위한 설정
            ctx.font = '20px Arial';
            // y 좌표에 10픽셀 추가하여 아래로 이동
            wrapText(ctx, formData.reason, previewCanvas.width * 0.21, previewCanvas.height * 0.45 + 10, previewCanvas.width * 0.6, 20);
            
            // 6. 하단 날짜 렌더링 - 시작 날짜 기준에서 종료 날짜 기준으로 변경
            ctx.font = '16px Arial';
            // 종료일을 기준으로 수정
            ctx.fillText(endDate.month, 695, 1119);
            ctx.fillText(endDate.day, 760, 1119);
            
            // 7-8. 학생 및 보호자 이름과 서명 배치
            // 학생 이름 - (인) 앞에 오게 
            ctx.fillText(info.name, 661, 1214);
            
            // 보호자 이름 - (인) 앞에 오게
            ctx.fillText(formData.guardianName, 661, 1246);
            
            // 서명 이미지 그리기 - (인) 위치에 맞게 사이즈 조정
            if (studentSigCanvas) {
                const studentSignatureImage = getSignatureImage(studentSigCanvas);
                const studentSigImg = new Image();
                studentSigImg.onload = function() {
                    // 학생 서명 - (인) 위치에 맞게 배치
                    ctx.drawImage(studentSigImg, 730, 1188, 100, 35);
                };
                studentSigImg.src = studentSignatureImage;
            }
            
            if (guardianSigCanvas) {
                const guardianSignatureImage = getSignatureImage(guardianSigCanvas);
                const guardianSigImg = new Image();
                guardianSigImg.onload = function() {
                    // 보호자 서명 - (인) 위치에 맞게 배치
                    ctx.drawImage(guardianSigImg, 730, 1228, 100, 35);
                };
                guardianSigImg.src = guardianSignatureImage;
            }
            
            console.log('미리보기 생성 완료');
        };
        
        formImage.onerror = function() {
            console.error('양식 이미지 로드 실패');
            alert('양식 이미지를 불러오는데 실패했습니다.');
        };
    }
    
    // 결석 유형에 동그라미 표시
    function drawCircleAroundType(ctx, type) {
        // 유형별 좌표 (form.png 이미지에 맞춰 조정 필요)
        const typeCoordinates = {
            '결석': { x: 336, y: 413 }, // y값 35픽셀 증가 (382 + 35)
            '지각': { x: 401, y: 413 }, // y값 35픽셀 증가 (382 + 35)
            '조퇴': { x: 463, y: 413 }, // y값 35픽셀 증가 (382 + 35)
            '결과': { x: 528, y: 413 }  // y값 35픽셀 증가 (382 + 35)
        };
        
        const coords = typeCoordinates[type];
        if (!coords) return;
        
        // 동그라미 그리기
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        console.log(`${type}에 동그라미 표시 완료:`, coords);
    }
    
    // 이미지 저장
    function saveImage() {
        console.log('이미지 저장 시작');
        
        if (!previewCanvas) {
            console.error('프리뷰 캔버스가 없습니다');
            alert('저장할 이미지를 찾을 수 없습니다.');
            return;
        }
        
        // 이미지 데이터 URL 생성
        const imageData = previewCanvas.toDataURL('image/png');
        
        // 현재 날짜 및 시간으로 파일명 생성
        const now = new Date();
        const fileName = `학부모확인서_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.png`;
        
        // iOS 디바이스 확인
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // 공유 API 지원 확인
        if (navigator.share && isIOS) {
            // 데이터 URL을 Blob으로 변환
            fetch(imageData)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], fileName, { type: 'image/png' });
                    
                    // 공유 다이얼로그 표시
                    navigator.share({
                        title: '학부모 확인서',
                        text: '학부모 확인서가 생성되었습니다.',
                        files: [file]
                    }).then(() => {
                        console.log('공유 성공');
                    }).catch((error) => {
                        console.error('공유 실패:', error);
                        // 공유 실패 시 일반 다운로드로 대체
                        downloadImage(imageData, fileName);
                    });
                });
        } else {
            // 일반 다운로드 방식
            downloadImage(imageData, fileName);
        }
    }
    
    // 일반 다운로드 함수
    function downloadImage(imageData, fileName) {
        // 다운로드 링크 생성 및 클릭
        const downloadLink = document.createElement('a');
        downloadLink.href = imageData;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log('이미지 저장 완료');
        
        // iOS 사용자를 위한 추가 안내
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            alert('이미지가 다운로드되었습니다. 사진첩에 저장하려면 이미지를 길게 누르거나 공유 버튼을 사용하세요.');
        } else {
            alert('이미지가 저장되었습니다.');
        }
    }
    
    // 숫자 앞에 0 채우기
    function pad(num) {
        return String(num).padStart(2, '0');
    }
    
    // 기본 날짜 설정 함수
    function setDefaultDates() {
        const today = new Date();
        const formattedDate = formatDateToInputValue(today);
        
        // 시작일과 종료일을 오늘 날짜로 설정
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = formattedDate;
        if (endDateInput) endDateInput.value = formattedDate;
        
        console.log('날짜 기본값 설정 완료:', formattedDate);
    }
    
    // 날짜를 input value 형식(YYYY-MM-DD)으로 변환
    function formatDateToInputValue(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 선택된 결석 유형 가져오기
    function getSelectedAbsenceType() {
        const selectedRadio = document.querySelector('input[name="absenceType"]:checked');
        return selectedRadio ? selectedRadio.value : '결석'; // 기본값은 '결석'
    }
    
    // 미리보기 확대/축소 설정
    function setupZoom() {
        if (!previewCanvas) return;
        
        // 터치 이벤트 리스너 추가
        previewCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        previewCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        previewCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // 더블 탭으로 확대/축소 리셋
        previewCanvas.addEventListener('dblclick', resetZoom);
    }
    
    // 터치 시작 이벤트 처리
    function handleTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            isZooming = true;
            
            // 두 손가락 사이의 거리 계산
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastDistance = calculateDistance(touch1, touch2);
            
            // 원본 이미지 저장 (아직 저장되지 않았다면)
            if (!originalPreviewImage) {
                originalPreviewImage = new Image();
                originalPreviewImage.src = previewCanvas.toDataURL();
            }
        }
    }
    
    // 터치 이동 이벤트 처리
    function handleTouchMove(e) {
        if (!isZooming || e.touches.length !== 2) return;
        
        e.preventDefault();
        
        // 새로운 거리 계산
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const newDistance = calculateDistance(touch1, touch2);
        
        // 스케일 조정 (거리 변화에 따라)
        const newScale = scale * (newDistance / lastDistance);
        
        // 스케일 제한 (0.5 ~ 3.0)
        if (newScale >= 0.5 && newScale <= 3.0) {
            scale = newScale;
            redrawWithScale();
        }
        
        lastDistance = newDistance;
    }
    
    // 터치 종료 이벤트 처리
    function handleTouchEnd(e) {
        isZooming = false;
    }
    
    // 확대/축소 초기화
    function resetZoom() {
        scale = 1;
        redrawWithScale();
    }
    
    // 두 터치 포인트 사이의 거리 계산
    function calculateDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 스케일에 따라 캔버스 다시 그리기
    function redrawWithScale() {
        if (!previewCanvas || !originalPreviewImage) return;
        
        const ctx = previewCanvas.getContext('2d');
        
        // 캔버스 크기 저장
        const width = previewCanvas.width;
        const height = previewCanvas.height;
        
        // 캔버스 지우기
        ctx.clearRect(0, 0, width, height);
        
        // 스케일 적용하여 다시 그리기
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        
        // 원본 이미지 그리기
        if (originalPreviewImage.complete) {
            ctx.drawImage(originalPreviewImage, 0, 0, width, height);
        } else {
            originalPreviewImage.onload = function() {
                ctx.drawImage(originalPreviewImage, 0, 0, width, height);
            };
        }
        
        ctx.restore();
    }
});
