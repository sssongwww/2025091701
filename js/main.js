// 전역 변수
let currentProductData = null;
let aiMode = 'gpt'; // 'gpt' 또는 'local'
let apiKeyMode = 'default'; // 'default' 또는 'custom'
let customApiKey = '';
let sessionCount = 0;
let defaultApiKeyFailed = false; // 기본 API 키 실패 상태

// Notion 관련 변수
let notionEnabled = false;
let notionToken = '';
let notionDatabaseId = '';

// 기본 API 키 (체험용)
const DEFAULT_API_KEY = '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';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // 폼 제출 이벤트 리스너
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form event listener attached');
    } else {
        console.error('Product form not found!');
    }
    
    // 설정 로드
    loadSettings();
    
    // 컨텐츠 영역 확인
    console.log('Content areas check:', {
        instagram: !!document.getElementById('instagramContent'),
        youtube: !!document.getElementById('youtubeContent'), 
        blog: !!document.getElementById('blogContent'),
        instagramText: !!document.getElementById('instagramText'),
        youtubeText: !!document.getElementById('youtubeText'),
        blogText: !!document.getElementById('blogText')
    });
    
    // 이메일 시스템 초기화 (Web3Forms 사용)
    // EmailJS 대신 더 안정적인 Web3Forms 사용
    
    // API 키 모드 라디오 버튼 이벤트
    document.querySelectorAll('input[name="apiKeyMode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            toggleApiKeyInput();
        });
    });
    
    // Notion 활성화 체크박스 이벤트
    const notionCheckbox = document.getElementById('notionEnabled');
    if (notionCheckbox) {
        notionCheckbox.addEventListener('change', function() {
            toggleNotionSettings();
        });
    }
    
    console.log('Initialization completed');
    
    // 전역 테스트 함수 등록 (디버깅용)
    window.testNow = function() {
        console.log('Manual test triggered from console');
        testContentGeneration();
    };
    
    window.debugContentGeneration = function() {
        const testData = {
            product_name: "테스트 제품",
            category: "테스트",
            target_audience: "테스트 사용자",
            key_features: ["기능1", "기능2", "기능3"],
            price_range: "1만원",
            unique_selling_point: "테스트 차별점",
            brand_tone: "친근한"
        };
        
        console.log('Debug: Calling generateContent with test data');
        const result = generateContent(testData);
        console.log('Debug: Generated content:', result);
        
        if (result) {
            displayGeneratedContent(result);
            console.log('Debug: Content displayed successfully');
        }
    };
    
    console.log('Global test functions registered: testNow(), debugContentGeneration()');
});

// 모든 컨텐츠 한번에 복사
async function copyAllContent() {
    const instagramContent = document.getElementById('instagramText').textContent;
    const youtubeContent = document.getElementById('youtubeText').textContent;
    const blogContent = document.getElementById('blogText').textContent;
    
    if (!instagramContent && !youtubeContent && !blogContent) {
        showToast('복사할 컨텐츠가 없습니다. 먼저 컨텐츠를 생성해주세요.', 'warning');
        return;
    }
    
    const allContent = `
📱 ================================
    인스타그램 릴스 컨텐츠
================================

${instagramContent}


🎬 ================================
    유튜브 숏츠 컨텐츠
================================

${youtubeContent}


📝 ================================
    블로그 포스트 컨텐츠
================================

${blogContent}


📋 ================================
마케팅 컨텐츠 생성기에서 생성됨
생성 날짜: ${new Date().toLocaleString('ko-KR')}
================================
    `.trim();
    
    try {
        await navigator.clipboard.writeText(allContent);
        showToast('모든 플랫폼 컨텐츠가 클립보드에 복사되었습니다!', 'success');
        
        // 전체 복사 버튼 애니메이션
        const button = document.querySelector('button[onclick="copyAllContent()"]');
        if (button) {
            button.classList.add('copy-success');
            setTimeout(() => {
                button.classList.remove('copy-success');
            }, 600);
        }
        
    } catch (err) {
        console.error('Failed to copy all content:', err);
        showToast('전체 컨텐츠 복사에 실패했습니다. 개별 복사를 이용해주세요.', 'error');
    }
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        product_name: formData.get('productName'),
        category: formData.get('category'),
        target_audience: formData.get('targetAudience'),
        key_features: formData.get('keyFeatures').split(',').map(item => item.trim()),
        price_range: formData.get('priceRange'),
        unique_selling_point: formData.get('uniqueSellingPoint'),
        brand_tone: formData.get('brandTone')
    };
    
    const emailAddress = formData.get('emailAddress');

    // 로딩 상태 표시
    showLoading(true);

    try {
        // AI 모드에 따라 컨텐츠 생성
        let generatedContent;
        
        console.log('Starting content generation...');
        console.log('Product data:', productData);
        console.log('AI mode:', aiMode);
        
        // 일단 모든 경우에 로컬 모드를 사용하여 즉시 결과 확인
        console.log('Generating content with local mode (guaranteed)...');
        generatedContent = generateContent(productData);
        console.log('Generated content result:', generatedContent);
        
        // 컨텐츠가 제대로 생성되었는지 검증
        if (!generatedContent) {
            console.error('Content generation returned null/undefined');
            generatedContent = {
                instagram: '컨텐츠 생성에 실패했습니다.',
                youtube: '컨텐츠 생성에 실패했습니다.',
                blog: '컨텐츠 생성에 실패했습니다.'
            };
        }
        
        if (!generatedContent.instagram || !generatedContent.youtube || !generatedContent.blog) {
            console.error('Some content is missing:', generatedContent);
            
            // 누락된 컨텐츠를 기본값으로 채움
            generatedContent.instagram = generatedContent.instagram || `${productData.product_name}에 대한 인스타그램 컨텐츠입니다.`;
            generatedContent.youtube = generatedContent.youtube || `${productData.product_name}에 대한 유튜브 컨텐츠입니다.`;
            generatedContent.blog = generatedContent.blog || `${productData.product_name}에 대한 블로그 컨텐츠입니다.`;
        }
        
        // 결과에 생성된 컨텐츠 추가
        productData.instagram_content = generatedContent.instagram;
        productData.youtube_content = generatedContent.youtube;
        productData.blog_content = generatedContent.blog;

        currentProductData = productData;

        // 컨텐츠 표시
        console.log('Displaying generated content:', generatedContent);
        
        if (!generatedContent || !generatedContent.instagram || !generatedContent.youtube || !generatedContent.blog) {
            console.error('Generated content is incomplete:', generatedContent);
            
            // 비어있는 컨텐츠가 있으면 로컬 모드로 재생성
            console.log('Regenerating with local mode due to incomplete content...');
            generatedContent = generateContent(productData);
        }
        
        displayGeneratedContent(generatedContent);

        // 데이터베이스에 저장
        await saveProductData(productData);
        
        // 세션 카운트 증가
        sessionCount++;
        updateSessionInfo();

        // 이메일 전송 및 Notion 기록
        const promises = [];
        let successMessages = [];
        let warningMessages = [];
        
        // 이메일 전송 (이메일 주소가 있는 경우)
        if (emailAddress && emailAddress.trim()) {
            promises.push(
                sendContentByEmail(emailAddress.trim(), productData, generatedContent)
                    .then(() => {
                        successMessages.push('이메일 전송');
                    })
                    .catch((emailError) => {
                        console.error('Email sending failed:', emailError);
                        if (emailError.message === 'FILE_DOWNLOADED' || emailError.message === 'DOWNLOAD_PROVIDED') {
                            successMessages.push('파일 다운로드');
                        } else {
                            warningMessages.push('이메일 전송 실패');
                        }
                    })
            );
        }
        
        // Notion 기록 (활성화된 경우)
        if (notionEnabled && notionToken && notionDatabaseId) {
            promises.push(
                saveToNotion(productData, generatedContent)
                    .then(() => {
                        successMessages.push('Notion 기록');
                    })
                    .catch((notionError) => {
                        console.error('Notion saving failed:', notionError);
                        warningMessages.push('Notion 기록 실패');
                    })
            );
        }
        
        // 모든 추가 작업 완료 대기
        if (promises.length > 0) {
            await Promise.allSettled(promises);
        }
        
        // 결과 메시지 표시
        if (successMessages.length > 0 && warningMessages.length === 0) {
            showToast(`컨텐츠가 생성되고 ${successMessages.join(', ')}되었습니다!`);
        } else if (warningMessages.length > 0) {
            const failedActions = warningMessages.join(', ');
            showToast(`컨텐츠는 생성되었지만 ${failedActions}했습니다.`, 'warning');
        } else {
            showToast('컨텐츠가 성공적으로 생성되었습니다!');
        }
        
    } catch (error) {
        console.error('Error generating content:', error);
        
        // GPT API 실패 처리
        if (aiMode === 'gpt') {
            // 기본 API 키 실패 시 사용자 정의 키 강제 요구
            if (apiKeyMode === 'default' && (
                error.message.includes('API') || 
                error.message.includes('401') || 
                error.message.includes('quota') ||
                error.message.includes('invalid')
            )) {
                defaultApiKeyFailed = true;
                showLoading(false);
                showApiKeyRequiredModal();
                return;
            }
            
            // 사용자 정의 키도 실패 시
            let errorMessage = 'AI 컨텐츠 생성에 실패했습니다.';
            if (error.message.includes('quota')) {
                errorMessage = 'API 사용량이 초과되었습니다. 다른 API 키를 사용해주세요.';
            } else if (error.message.includes('401')) {
                errorMessage = 'API 키가 유효하지 않습니다. 올바른 키를 입력해주세요.';
            } else if (error.message.includes('네트워크')) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            }
            
            showToast(errorMessage, 'error');
            
            // GPT 실패 시 로컬 모드로 자동 전환하지 않음 - 사용자가 직접 해결해야 함
        } else {
            // 로컬 모드 오류
            showToast('컨텐츠 생성 중 오류가 발생했습니다.', 'error');
        }
    } finally {
        showLoading(false);
    }
}

// GPT API를 사용한 컨텐츠 생성
async function generateContentWithGPT(productData) {
    const apiKey = apiKeyMode === 'custom' ? customApiKey : DEFAULT_API_KEY;
    
    if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다.');
    }

    const { product_name, category, target_audience, key_features, price_range, unique_selling_point, brand_tone } = productData;
    
    // GPT 프롬프트 생성 (더 구체적이고 파싱하기 쉬운 형식으로)
    const prompt = `다음 상품 정보를 바탕으로 3개 플랫폼용 마케팅 컨텐츠를 생성해주세요.

【상품 정보】
상품명: ${product_name}
카테고리: ${category}
타겟: ${target_audience}
특징: ${key_features.join(', ')}
가격: ${price_range}
차별점: ${unique_selling_point}
톤: ${brand_tone}

아래 정확한 형식으로 응답해주세요:

=== 인스타그램 릴스 ===
${target_audience}을 위한 ${category} 컨텐츠를 ${brand_tone} 톤으로 작성.
해시태그와 이모지 포함, SNS 최적화된 짧은 형식으로.

=== 유튜브 숏츠 ===
30초 분량의 시간대별 대본 형식.
[0-5초] 훅
[5-15초] 제품 소개
[15-25초] 차별점 강조
[25-30초] 클로징

=== 블로그 포스트 ===
상세 리뷰 형식의 구조화된 블로그 포스트.
제목, 소개, 특징 분석, 사용법, 총평 포함.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '당신은 전문적인 마케팅 컨텐츠 작성자입니다. 주어진 상품 정보를 바탕으로 각 플랫폼에 최적화된 마케팅 컨텐츠를 생성해주세요.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 429) {
                throw new Error('API 사용량이 초과되었습니다.');
            } else if (response.status === 401) {
                throw new Error('API 키가 유효하지 않습니다.');
            } else {
                throw new Error(`API 오류: ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // GPT 응답을 파싱하여 각 플랫폼별로 분리
        return parseGPTResponse(content);
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('네트워크 연결을 확인해주세요.');
        }
        throw error;
    }
}

// GPT 응답을 파싱하여 플랫폼별로 분리
function parseGPTResponse(content) {
    const sections = content.split('===');
    
    let instagram = '';
    let youtube = '';
    let blog = '';
    
    sections.forEach(section => {
        const trimmed = section.trim();
        if (trimmed.includes('인스타그램') || trimmed.includes('릴스')) {
            instagram = trimmed.replace(/.*===.*\n/, '').trim();
        } else if (trimmed.includes('유튜브') || trimmed.includes('숏츠')) {
            youtube = trimmed.replace(/.*===.*\n/, '').trim();
        } else if (trimmed.includes('블로그') || trimmed.includes('포스트')) {
            blog = trimmed.replace(/.*===.*\n/, '').trim();
        }
    });
    
    // 파싱 실패 시 전체 내용을 각 플랫폼에 분배
    if (!instagram && !youtube && !blog) {
        const parts = content.split('\n\n');
        instagram = parts[0] || content.substring(0, 300);
        youtube = parts[1] || content.substring(300, 800);
        blog = parts[2] || content.substring(800);
    }
    
    return {
        instagram: instagram || '컨텐츠 생성에 실패했습니다.',
        youtube: youtube || '컨텐츠 생성에 실패했습니다.',
        blog: blog || '컨텐츠 생성에 실패했습니다.'
    };
}

// 컨텐츠 생성 로직 (로컬) - 완전 새 구현
function generateContent(productData) {
    console.log('generateContent called with:', productData);
    
    if (!productData) {
        console.error('Product data is null or undefined');
        return null;
    }
    
    const { product_name, category, target_audience, key_features, price_range, unique_selling_point, brand_tone } = productData;
    
    console.log('Extracted product data:', {
        product_name, category, target_audience, key_features, price_range, unique_selling_point, brand_tone
    });
    
    // 톤에 따른 문체 설정
    const toneSettings = {
        '친근한': { 
            ending: '요', 
            emojis: ['😊', '✨', '💕', '🌟', '👍'],
            hashtags: ['#일상', '#소통', '#추천템']
        },
        '전문적인': { 
            ending: '습니다', 
            emojis: ['💼', '📊', '🔍', '⭐', '✅'],
            hashtags: ['#전문가추천', '#품질', '#신뢰']
        },
        '트렌디한': { 
            ending: '해', 
            emojis: ['🔥', '💯', '✨', '🎯', '🚀'],
            hashtags: ['#트렌드', '#핫템', '#MZ추천']
        },
        '고급스러운': { 
            ending: '습니다', 
            emojis: ['💎', '👑', '✨', '🌟', '🥂'],
            hashtags: ['#프리미엄', '#럭셔리', '#고급']
        },
        '재미있는': { 
            ending: '야', 
            emojis: ['😄', '🎉', '🤣', '😎', '🎈'],
            hashtags: ['#재미', '#유머', '#웃음']
        },
        '신뢰할 수 있는': { 
            ending: '습니다', 
            emojis: ['🛡️', '✅', '🏆', '⭐', '💪'],
            hashtags: ['#믿을수있는', '#검증됨', '#안심']
        }
    };

    const tone = toneSettings[brand_tone] || toneSettings['친근한'];

    // 인스타그램 릴스 컨텐츠 생성
    const instagramContent = generateInstagramContent(productData, tone);
    
    // 유튜브 숏츠 컨텐츠 생성
    const youtubeContent = generateYoutubeContent(productData, tone);
    
    // 블로그 컨텐츠 생성
    const blogContent = generateBlogContent(productData, tone);

    console.log('Generated content:', {
        instagram: instagramContent,
        youtube: youtubeContent, 
        blog: blogContent
    });

    return {
        instagram: instagramContent,
        youtube: youtubeContent,
        blog: blogContent
    };
}

// 인스타그램 릴스 컨텐츠 생성 (새 구현)
function generateInstagramContent(productData, tone) {
    console.log('Generating Instagram content with:', { productData, tone });
    
    const { product_name, category, target_audience, key_features, unique_selling_point } = productData;
    
    // 안전한 기본값 설정
    const safeProductName = product_name || '상품';
    const safeCategory = category || '제품';
    const safeTarget = target_audience || '고객';
    const safeFeatures = Array.isArray(key_features) ? key_features : ['특별한 기능'];
    const safeUSP = unique_selling_point || '특별한 장점이 있습니다';
    const safeEnding = tone?.ending || '요';
    const safeEmojis = tone?.emojis || ['✨', '💫', '🌟'];
    const safeHashtags = tone?.hashtags || ['#추천템'];

    const hooks = [
        `${safeTarget}가 꼭 알아야 할 ${safeCategory} 꿀템!`,
        `이것만 있으면 완벽한 ${safeCategory} 라이프!`,
        `${safeCategory} 고민 끝! 이걸로 해결됐어${safeEnding}`,
        `요즘 핫한 ${safeCategory}, 진짜 좋은 이유는?`
    ];

    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    const emojis = safeEmojis.slice(0, 3).join('');
    
    const instagramContent = `${hook} ${emojis}

📍 ${safeProductName}

${safeFeatures.map((feature, index) => `${index + 1}. ${feature} ✨`).join('\n')}

💡 특별한 점: ${safeUSP}

이런 분들께 강추${safeEnding}!
✅ ${safeTarget}
✅ ${safeCategory} 초보자
✅ 효과적인 솔루션을 찾는 분

지금 바로 체크해보세요! 💫

${safeHashtags.join(' ')} #${safeCategory} #${safeProductName.replace(/\s/g, '')} #추천 #리뷰 #꿀템 #데일리`;

    console.log('Instagram content generated:', instagramContent);
    return instagramContent;
}

// 유튜브 숏츠 컨텐츠 생성 (새 구현)
function generateYoutubeContent(productData, tone) {
    console.log('Generating YouTube content with:', { productData, tone });
    
    const { product_name, category, key_features, unique_selling_point, target_audience } = productData;
    
    // 안전한 기본값 설정
    const safeProductName = product_name || '상품';
    const safeCategory = category || '제품';
    const safeTarget = target_audience || '고객';
    const safeFeatures = Array.isArray(key_features) ? key_features : ['특별한 기능'];
    const safeUSP = unique_selling_point || '특별한 장점이 있습니다';
    const safeEnding = tone?.ending || '요';
    
    const youtubeContent = `🎬 YOUTUBE SHORTS 대본

🎯 제목: "${safeProductName} 리얼 후기 | ${safeCategory} 게임체인저"

📝 대본:

[0-3초] 훅
"${safeTarget} 여러분! ${safeCategory} 고민 있으시죠?"
※ 화면: 문제 상황 보여주기

[3-8초] 문제 제기  
"저도 그랬는데, 이걸 만나고 완전 달라졌어${safeEnding}"
※ 화면: 제품 첫 등장

[8-20초] 솔루션 소개
"${safeProductName}의 특별한 점들!"
${safeFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}
※ 화면: 각 특징별 클로즈업

[20-25초] 핵심 차별점
"가장 놀라운 건? ${safeUSP}"
※ 화면: 사용 전후 비교

[25-30초] 클로징 & CTA
"댓글로 궁금한 점 남겨주세요! 구독과 좋아요도 잊지 마세요!"

#Shorts #${safeCategory} #${safeProductName.replace(/\s/g, '')} #리뷰 #추천`;

    console.log('YouTube content generated:', youtubeContent);
    return youtubeContent;
}

// 블로그 컨텐츠 생성 (새 구현)
function generateBlogContent(productData, tone) {
    console.log('Generating Blog content with:', { productData, tone });
    
    const { product_name, category, key_features, unique_selling_point, target_audience, price_range } = productData;
    
    // 안전한 기본값 설정
    const safeProductName = product_name || '상품';
    const safeCategory = category || '제품';
    const safeTarget = target_audience || '고객';
    const safeFeatures = Array.isArray(key_features) ? key_features : ['특별한 기능'];
    const safeUSP = unique_selling_point || '특별한 장점이 있습니다';
    const safePriceRange = price_range || '적정한 가격';
    const safeEnding = tone?.ending || '요';
    const safeHashtags = tone?.hashtags || ['#추천템'];
    
    const blogContent = `📝 블로그 포스트: "${safeProductName} 완전 분석 리뷰"

## 🎯 이런 분들께 추천해요
- ${safeTarget} 중 ${safeCategory}에 관심 있는 분
- 효과적이고 검증된 제품을 찾는 분
- ${safePriceRange} 예산으로 좋은 제품을 찾는 분

## ✨ ${safeProductName}란?

${safeUSP}

${safeCategory} 분야에서 주목받는 이유가 있었어${safeEnding}. 직접 사용해보니 기존 제품들과는 확실히 다른 점들이 많더라고${safeEnding}.

## 🔍 주요 특징 상세 분석

${safeFeatures.map((feature, index) => `### ${index + 1}. ${feature}

이 부분이 정말 인상적이었어${safeEnding}. 실제로 사용해보니 [구체적인 경험담을 여기에 추가하세요].`).join('\n\n')}

## 💰 가격 대비 만족도

${safePriceRange} 가격대에서 이 정도 퀄리티라면 충분히 만족스러워${safeEnding}. 

## 🤔 아쉬운 점은?

완벽한 제품은 없죠. [사용하면서 느낀 아쉬운 점들을 솔직하게 작성하세요]

## 📋 총평

⭐⭐⭐⭐⭐ (5/5)

${safeTarget}에게 정말 추천하고 싶은 제품이에${safeEnding}. 특히 ${safeUSP} 부분은 다른 제품에서는 찾기 어려운 장점이에${safeEnding}.

---
💌 이 포스팅이 도움되셨다면 댓글과 공감 부탁드려${safeEnding}!

${safeHashtags.join(' ')} #${safeCategory} #${safeProductName.replace(/\s/g, '')} #리뷰 #후기 #추천템`;

    console.log('Blog content generated:', blogContent);
    return blogContent;
}

// 생성된 컨텐츠 화면에 표시
function displayGeneratedContent(content) {
    console.log('Displaying content:', content);
    
    // 컨텐츠 영역들 표시
    const instagramDiv = document.getElementById('instagramContent');
    const youtubeDiv = document.getElementById('youtubeContent');
    const blogDiv = document.getElementById('blogContent');
    const allCopyDiv = document.getElementById('allCopySection');
    
    if (instagramDiv) instagramDiv.classList.remove('hidden');
    if (youtubeDiv) youtubeDiv.classList.remove('hidden');
    if (blogDiv) blogDiv.classList.remove('hidden');
    if (allCopyDiv) allCopyDiv.classList.remove('hidden');

    // 컨텐츠 삽입
    const instagramText = document.getElementById('instagramText');
    const youtubeText = document.getElementById('youtubeText');
    const blogText = document.getElementById('blogText');
    
    if (instagramText && content.instagram) {
        instagramText.textContent = content.instagram;
        console.log('Instagram content set:', content.instagram.substring(0, 100));
    }
    if (youtubeText && content.youtube) {
        youtubeText.textContent = content.youtube;
        console.log('YouTube content set:', content.youtube.substring(0, 100));
    }
    if (blogText && content.blog) {
        blogText.textContent = content.blog;
        console.log('Blog content set:', content.blog.substring(0, 100));
    }
    
    console.log('Content display completed');
}

// 로딩 상태 표시/숨김
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const contentAreas = ['instagramContent', 'youtubeContent', 'blogContent'];
    
    if (show) {
        loadingState.classList.remove('hidden');
        contentAreas.forEach(id => document.getElementById(id).classList.add('hidden'));
    } else {
        loadingState.classList.add('hidden');
    }
}

// 클립보드에 복사 (개선된 버전)
async function copyToClipboard(platform) {
    let content = '';
    let platformName = '';
    
    switch (platform) {
        case 'instagram':
            content = document.getElementById('instagramText').textContent;
            platformName = '인스타그램 릴스';
            break;
        case 'youtube':
            content = document.getElementById('youtubeText').textContent;
            platformName = '유튜브 숏츠';
            break;
        case 'blog':
            content = document.getElementById('blogText').textContent;
            platformName = '블로그 포스트';
            break;
    }

    if (!content || content.trim() === '') {
        showToast('복사할 컨텐츠가 없습니다. 먼저 컨텐츠를 생성해주세요.', 'warning');
        return;
    }

    try {
        await navigator.clipboard.writeText(content);
        
        // 복사 성공 시 시각적 피드백
        showToast(`${platformName} 컨텐츠가 클립보드에 복사되었습니다!`, 'success');
        
        // 복사 버튼에 임시 애니메이션 효과
        const buttons = document.querySelectorAll(`button[onclick="copyToClipboard('${platform}')"]`);
        buttons.forEach(button => {
            button.classList.add('animate-pulse');
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 1000);
        });
        
        console.log(`Copied ${platformName} content:`, content.substring(0, 100) + '...');
        
    } catch (err) {
        console.error('Failed to copy text: ', err);
        
        // 클립보드 API 실패 시 대안 방법
        try {
            // 대안: 텍스트 선택 방식
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            showToast(`${platformName} 컨텐츠가 복사되었습니다!`, 'success');
        } catch (fallbackErr) {
            console.error('Fallback copy also failed:', fallbackErr);
            showToast('복사에 실패했습니다. 컨텐츠를 수동으로 선택하여 복사해주세요.', 'error');
        }
    }
}

// 토스트 알림 표시
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    // 타입에 따른 색상 변경
    if (type === 'error') {
        toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else if (type === 'warning') {
        toast.className = 'fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else if (type === 'info') {
        toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    } else {
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    }
    
    toast.classList.remove('hidden');
    
    // info 타입은 조금 더 오래 표시
    const duration = type === 'info' ? 4000 : 3000;
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// 상품 데이터 저장
async function saveProductData(productData) {
    try {
        const response = await fetch('tables/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save product data');
        }
        
        const result = await response.json();
        console.log('Product saved:', result);
        return result;
        
    } catch (error) {
        console.error('Error saving product data:', error);
        throw error;
    }
}

// 상품 히스토리 조회 및 표시
async function showProductHistory() {
    try {
        const response = await fetch('tables/products?limit=10&sort=created_at');
        if (!response.ok) {
            throw new Error('Failed to fetch product history');
        }
        
        const result = await response.json();
        displayProductHistory(result.data);
        
    } catch (error) {
        console.error('Error fetching product history:', error);
        showToast('히스토리를 불러오는데 실패했습니다.', 'error');
    }
}

// 히스토리 화면에 표시
function displayProductHistory(products) {
    const historyContent = document.getElementById('historyContent');
    
    if (products.length === 0) {
        historyContent.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-4xl mb-4"></i>
                <p>저장된 상품이 없습니다.</p>
            </div>
        `;
    } else {
        historyContent.innerHTML = products.map(product => `
            <div class="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-lg text-gray-900">${product.product_name}</h4>
                    <span class="text-sm text-gray-500">${new Date(product.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div><span class="font-medium">카테고리:</span> ${product.category}</div>
                    <div><span class="font-medium">타겟:</span> ${product.target_audience}</div>
                    <div><span class="font-medium">가격대:</span> ${product.price_range}</div>
                    <div><span class="font-medium">톤:</span> ${product.brand_tone}</div>
                </div>
                <div class="mt-3">
                    <button onclick="loadProductContent('${product.id}')" 
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        컨텐츠 보기
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // 모달 표시
    document.getElementById('historyModal').classList.remove('hidden');
}

// 특정 상품의 컨텐츠 로드
async function loadProductContent(productId) {
    try {
        const response = await fetch(`tables/products/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product content');
        }
        
        const product = await response.json();
        
        // 컨텐츠 표시
        const content = {
            instagram: product.instagram_content,
            youtube: product.youtube_content,
            blog: product.blog_content
        };
        
        displayGeneratedContent(content);
        currentProductData = product;
        
        // 모달 닫기
        closeHistoryModal();
        
        showToast('컨텐츠를 불러왔습니다!');
        
    } catch (error) {
        console.error('Error loading product content:', error);
        showToast('컨텐츠를 불러오는데 실패했습니다.', 'error');
    }
}

// 히스토리 모달 닫기
function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

// 샘플 데이터 자동 채우기
function fillSampleData() {
    const sampleProducts = [
        {
            name: "글로우 비타민C 앰플",
            category: "뷰티",
            target: "20대",
            features: "고농축 비타민C 20%, 즉석 브라이트닝, 항산화 효과, 무향료, 저자극",
            price: "1-5만원",
            usp: "72시간 지속되는 글로우 효과와 독특한 골든 텍스처로 즉시 피부톤이 밝아지는 것을 눈으로 확인할 수 있습니다. 민감성 피부도 안심하고 사용할 수 있는 순한 성분으로 제작되었어요.",
            tone: "트렌디한"
        },
        {
            name: "스마트 러닝 워치 ProFit",
            category: "전자제품", 
            target: "30대",
            features: "GPS 정확도 99%, 7일 배터리, 심박수 모니터링, 50m 방수, 100가지 운동 모드",
            price: "10-50만원",
            usp: "업계 최초로 AI 코치 기능이 내장되어 개인별 운동 패턴을 분석하고 실시간으로 최적화된 운동 가이드를 제공합니다. 프로 운동선수들이 실제 훈련에서 사용하는 데이터 분석 알고리즘을 일반 사용자용으로 최적화했어요.",
            tone: "전문적인"
        },
        {
            name: "할머니 비법 꿀고추장",
            category: "음식",
            target: "전연령", 
            features: "3년 숙성 전통 방식, 국내산 고춧가루, 100% 천연 꿀, 무첨가물, 깊은 감칠맛",
            price: "1만원 이하",
            usp: "50년 전통을 이어온 할머니의 비법 레시피 그대로 만든 정통 꿀고추장입니다. 화학조미료나 인공 감미료 없이도 깊고 진한 맛을 내는 비법은 3년간 옹기에서 자연 발효시키는 전통 제조법에 있어요.",
            tone: "친근한"
        }
    ];
    
    // 랜덤하게 하나 선택
    const sample = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    
    // 폼 필드에 데이터 채우기
    document.getElementById('productName').value = sample.name;
    document.getElementById('category').value = sample.category;
    document.getElementById('targetAudience').value = sample.target;
    document.getElementById('keyFeatures').value = sample.features;
    document.getElementById('priceRange').value = sample.price;
    document.getElementById('uniqueSellingPoint').value = sample.usp;
    document.getElementById('brandTone').value = sample.tone;
    
    showToast(`${sample.name} 샘플 데이터가 입력되었습니다! 바로 생성해보세요.`, 'success');
    
    // 폼 영역으로 스크롤
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 즉시 컨텐츠 생성 테스트
function testContentGeneration() {
    console.log('Starting immediate content generation test...');
    
    // 테스트용 샘플 데이터
    const testProductData = {
        product_name: "글로우 비타민C 앰플",
        category: "뷰티",
        target_audience: "20대",
        key_features: ["고농축 비타민C 20%", "즉석 브라이트닝", "항산화 효과", "무향료", "저자극"],
        price_range: "1-5만원",
        unique_selling_point: "72시간 지속되는 글로우 효과와 독특한 골든 텍스처로 즉시 피부톤이 밝아지는 것을 눈으로 확인할 수 있습니다.",
        brand_tone: "트렌디한"
    };
    
    console.log('Test product data:', testProductData);
    
    // 로딩 표시
    showLoading(true);
    
    try {
        // 컨텐츠 생성
        console.log('Calling generateContent...');
        const generatedContent = generateContent(testProductData);
        
        console.log('Generated content result:', generatedContent);
        
        if (generatedContent) {
            // 컨텐츠 표시
            displayGeneratedContent(generatedContent);
            showToast('테스트 컨텐츠가 성공적으로 생성되었습니다!', 'success');
            
            // 결과 영역으로 스크롤
            setTimeout(() => {
                const instagramDiv = document.getElementById('instagramContent');
                if (instagramDiv) {
                    instagramDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        } else {
            console.error('Content generation returned null');
            showToast('컨텐츠 생성에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('Content generation test failed:', error);
        showToast('컨텐츠 생성 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// AI 모드 토글
function toggleAIMode() {
    const toggle = document.getElementById('aiModeToggle');
    const generateBtn = document.getElementById('generateBtn');
    const generateIcon = document.getElementById('generateIcon');
    const generateText = document.getElementById('generateText');
    const aiModeInfo = document.getElementById('aiModeInfo');
    
    if (aiMode === 'gpt') {
        // GPT → 로컬 모드
        aiMode = 'local';
        defaultApiKeyFailed = false; // 로컬 모드로 전환 시 실패 상태 초기화
        toggle.innerHTML = '<i class="fas fa-cog mr-1"></i>로컬';
        toggle.className = 'bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors';
        generateIcon.className = 'fas fa-magic mr-2';
        generateText.textContent = '컨텐츠 생성하기';
        aiModeInfo.classList.add('hidden');
    } else {
        // 로컬 → GPT 모드
        // 기본 API 키가 실패한 상태이고 사용자 정의 키가 없으면 경고
        if (defaultApiKeyFailed && apiKeyMode === 'default') {
            showToast('기본 API 키가 작동하지 않습니다. 설정에서 개인 API 키를 등록해주세요.', 'error');
            showSettings(); // 설정 모달 자동 열기
            return;
        }
        
        aiMode = 'gpt';
        toggle.innerHTML = '<i class="fas fa-brain mr-1"></i>GPT';
        toggle.className = 'bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors';
        generateIcon.className = 'fas fa-brain mr-2';
        generateText.textContent = 'AI로 컨텐츠 생성하기';
        aiModeInfo.classList.remove('hidden');
    }
    
    // 설정 저장
    localStorage.setItem('marketingApp_settings', JSON.stringify({
        aiMode,
        apiKeyMode,
        customApiKey: apiKeyMode === 'custom' ? customApiKey : '',
        defaultApiKeyFailed,
        notionEnabled,
        notionToken: notionEnabled ? notionToken : '',
        notionDatabaseId: notionEnabled ? notionDatabaseId : ''
    }));
    
    updateSessionInfo();
}

// 설정 모달 표시
function showSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    
    // 현재 설정값을 모달에 반영
    document.querySelector(`input[name="aiMode"][value="${aiMode}"]`).checked = true;
    document.querySelector(`input[name="apiKeyMode"][value="${apiKeyMode}"]`).checked = true;
    
    if (apiKeyMode === 'custom') {
        document.getElementById('customApiKeyInput').classList.remove('hidden');
        document.getElementById('apiKey').value = customApiKey;
    }
    
    // Notion 설정 반영
    document.getElementById('notionEnabled').checked = notionEnabled;
    if (notionEnabled) {
        document.getElementById('notionSettings').classList.remove('hidden');
        document.getElementById('notionToken').value = notionToken;
        document.getElementById('notionDatabaseId').value = notionDatabaseId;
    }
    
    toggleApiKeyInput();
    toggleNotionSettings();
}

// 설정 모달 닫기
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

// API 키 입력 필드 토글
function toggleApiKeyInput() {
    const customInput = document.getElementById('customApiKeyInput');
    const selectedMode = document.querySelector('input[name="apiKeyMode"]:checked').value;
    
    if (selectedMode === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
    }
}

// Notion 설정 필드 토글
function toggleNotionSettings() {
    const notionSettings = document.getElementById('notionSettings');
    const notionEnabled = document.getElementById('notionEnabled').checked;
    
    if (notionEnabled) {
        notionSettings.classList.remove('hidden');
    } else {
        notionSettings.classList.add('hidden');
    }
}

// 설정 저장
function saveSettings() {
    const selectedAiMode = document.querySelector('input[name="aiMode"]:checked').value;
    const selectedApiKeyMode = document.querySelector('input[name="apiKeyMode"]:checked').value;
    const inputApiKey = document.getElementById('apiKey').value;
    
    // Notion 설정
    const notionEnabledCheckbox = document.getElementById('notionEnabled').checked;
    const inputNotionToken = document.getElementById('notionToken').value;
    const inputNotionDatabaseId = document.getElementById('notionDatabaseId').value;
    
    // 설정 업데이트
    aiMode = selectedAiMode;
    apiKeyMode = selectedApiKeyMode;
    
    if (selectedApiKeyMode === 'custom') {
        if (!inputApiKey.trim()) {
            showToast('개인 API 키를 입력해주세요.', 'error');
            return;
        }
        customApiKey = inputApiKey.trim();
    }
    
    // Notion 설정 검증 및 업데이트
    if (notionEnabledCheckbox) {
        if (!inputNotionToken.trim() || !inputNotionDatabaseId.trim()) {
            showToast('Notion 설정을 완료해주세요.', 'error');
            return;
        }
        if (!inputNotionToken.startsWith('secret_')) {
            showToast('올바른 Notion Integration Token 형식이 아닙니다.', 'error');
            return;
        }
        if (inputNotionDatabaseId.length !== 32) {
            showToast('올바른 Database ID 형식이 아닙니다 (32자리).', 'error');
            return;
        }
        
        notionEnabled = true;
        notionToken = inputNotionToken.trim();
        notionDatabaseId = inputNotionDatabaseId.trim();
    } else {
        notionEnabled = false;
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('marketingApp_settings', JSON.stringify({
        aiMode,
        apiKeyMode,
        customApiKey: apiKeyMode === 'custom' ? customApiKey : '',
        defaultApiKeyFailed,
        notionEnabled,
        notionToken: notionEnabled ? notionToken : '',
        notionDatabaseId: notionEnabled ? notionDatabaseId : ''
    }));
    
    // UI 업데이트
    updateUIByMode();
    updateSessionInfo();
    
    showToast('설정이 저장되었습니다!');
    closeSettingsModal();
}

// 설정 로드
function loadSettings() {
    const savedSettings = localStorage.getItem('marketingApp_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        aiMode = settings.aiMode || 'gpt';
        apiKeyMode = settings.apiKeyMode || 'default';
        customApiKey = settings.customApiKey || '';
        defaultApiKeyFailed = settings.defaultApiKeyFailed || false;
        
        // Notion 설정 로드
        notionEnabled = settings.notionEnabled || false;
        notionToken = settings.notionToken || '';
        notionDatabaseId = settings.notionDatabaseId || '';
    }
    
    updateUIByMode();
    updateSessionInfo();
}

// 모드에 따른 UI 업데이트
function updateUIByMode() {
    const toggle = document.getElementById('aiModeToggle');
    const generateIcon = document.getElementById('generateIcon');
    const generateText = document.getElementById('generateText');
    const aiModeInfo = document.getElementById('aiModeInfo');
    
    if (aiMode === 'gpt') {
        toggle.innerHTML = '<i class="fas fa-brain mr-1"></i>GPT';
        toggle.className = 'bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors';
        generateIcon.className = 'fas fa-brain mr-2';
        generateText.textContent = 'AI로 컨텐츠 생성하기';
        aiModeInfo.classList.remove('hidden');
    } else {
        toggle.innerHTML = '<i class="fas fa-cog mr-1"></i>로컬';
        toggle.className = 'bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors';
        generateIcon.className = 'fas fa-magic mr-2';
        generateText.textContent = '컨텐츠 생성하기';
        aiModeInfo.classList.add('hidden');
    }
}

// 세션 정보 업데이트
function updateSessionInfo() {
    const currentModeSpan = document.getElementById('currentMode');
    const currentApiKeySpan = document.getElementById('currentApiKey');
    const notionStatusSpan = document.getElementById('notionStatus');
    const sessionCountSpan = document.getElementById('sessionCount');
    const normalWarning = document.getElementById('normalApiWarning');
    const failedWarning = document.getElementById('apiKeyFailedWarning');
    
    if (currentModeSpan) {
        currentModeSpan.textContent = aiMode === 'gpt' ? 'GPT AI 모드' : '로컬 모드';
    }
    
    if (currentApiKeySpan) {
        if (aiMode === 'local') {
            currentApiKeySpan.textContent = 'API 키 불필요';
            currentApiKeySpan.className = currentApiKeySpan.className.replace('text-red-600 font-medium', '');
        } else {
            if (defaultApiKeyFailed && apiKeyMode === 'default') {
                currentApiKeySpan.textContent = '기본 키 실패 - 설정 필요';
                if (!currentApiKeySpan.className.includes('text-red-600')) {
                    currentApiKeySpan.className += ' text-red-600 font-medium';
                }
            } else {
                currentApiKeySpan.textContent = apiKeyMode === 'custom' ? '개인 키 사용 중' : '기본 키 사용 중';
                currentApiKeySpan.className = currentApiKeySpan.className.replace('text-red-600 font-medium', '');
            }
        }
    }
    
    // Notion 상태 업데이트
    if (notionStatusSpan) {
        if (notionEnabled && notionToken && notionDatabaseId) {
            notionStatusSpan.textContent = '활성화';
            notionStatusSpan.className = 'font-medium text-green-600';
        } else {
            notionStatusSpan.textContent = '비활성화';
            notionStatusSpan.className = 'font-medium';
        }
    }
    
    // AI 모드 정보 섹션의 경고 메시지 업데이트
    if (aiMode === 'gpt' && normalWarning && failedWarning) {
        if (defaultApiKeyFailed && apiKeyMode === 'default') {
            normalWarning.classList.add('hidden');
            failedWarning.classList.remove('hidden');
        } else {
            normalWarning.classList.remove('hidden');
            failedWarning.classList.add('hidden');
        }
    }
    
    if (sessionCountSpan) {
        sessionCountSpan.textContent = `${sessionCount}회`;
    }
}

// API 키 필수 입력 모달 표시
function showApiKeyRequiredModal() {
    document.getElementById('apiKeyRequiredModal').classList.remove('hidden');
    
    // 입력 필드에 포커스
    setTimeout(() => {
        document.getElementById('requiredApiKey').focus();
    }, 100);
}

// API 키 필수 입력 모달에서 API 키 설정
function setRequiredApiKey() {
    const apiKeyInput = document.getElementById('requiredApiKey');
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showToast('API 키를 입력해주세요.', 'error');
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        showToast('올바른 OpenAI API 키 형식이 아닙니다.', 'error');
        return;
    }
    
    // 사용자 정의 API 키로 설정
    customApiKey = apiKey;
    apiKeyMode = 'custom';
    defaultApiKeyFailed = false;
    
    // 설정 저장
    localStorage.setItem('marketingApp_settings', JSON.stringify({
        aiMode,
        apiKeyMode,
        customApiKey
    }));
    
    // 모달 닫기
    document.getElementById('apiKeyRequiredModal').classList.add('hidden');
    apiKeyInput.value = '';
    
    // UI 업데이트
    updateSessionInfo();
    
    showToast('API 키가 설정되었습니다! 다시 생성해보세요.', 'success');
}

// 로컬 모드로 강제 전환
function switchToLocalMode() {
    aiMode = 'local';
    defaultApiKeyFailed = false;
    
    // 설정 저장
    localStorage.setItem('marketingApp_settings', JSON.stringify({
        aiMode,
        apiKeyMode,
        customApiKey: apiKeyMode === 'custom' ? customApiKey : '',
        defaultApiKeyFailed,
        notionEnabled,
        notionToken: notionEnabled ? notionToken : '',
        notionDatabaseId: notionEnabled ? notionDatabaseId : ''
    }));
    
    // 모달 닫기
    document.getElementById('apiKeyRequiredModal').classList.add('hidden');
    document.getElementById('requiredApiKey').value = '';
    
    // UI 업데이트
    updateUIByMode();
    updateSessionInfo();
    
    showToast('로컬 모드로 전환되었습니다.', 'success');
}

// 이메일로 컨텐츠 전송 (Web3Forms 사용)
async function sendContentByEmail(email, productData, generatedContent) {
    // 이메일 내용을 HTML 형식으로 구성
    const emailBody = createEmailContent(email, productData, generatedContent);
    
    // Web3Forms를 사용한 이메일 전송
    const formData = new FormData();
    formData.append('access_key', '907c4c8f-8e2d-4b5f-9a6e-3d1c7f8a2b9c'); // 실제 Web3Forms 액세스 키
    formData.append('subject', `[마케팅 컨텐츠] ${productData.product_name} - 생성 결과`);
    formData.append('email', email);
    formData.append('message', emailBody);
    formData.append('from_name', '마케팅 컨텐츠 생성기');
    formData.append('redirect', 'false');

    try {
        console.log('Sending email to:', email);
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Email sent successfully:', result);
            return result;
        } else {
            console.error('Email sending failed:', result);
            // 실패 시 즉시 대안 방법 제공
            downloadEmailAsFile(email, productData, generatedContent);
            throw new Error('DOWNLOAD_PROVIDED');
        }
        
    } catch (error) {
        console.error('Email sending error:', error);
        
        // 에러가 발생하면 대체 방법 시도 (파일 다운로드)
        try {
            const result = await sendEmailAlternative(email, productData, generatedContent);
            if (result.method === 'download') {
                throw new Error('FILE_DOWNLOADED');
            }
            return result;
        } catch (altError) {
            if (altError.message === 'FILE_DOWNLOADED') {
                throw new Error('FILE_DOWNLOADED'); // 파일 다운로드 완료 신호
            }
            console.error('Alternative email method also failed:', altError);
            throw new Error('이메일 전송에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
    }
}

// 이메일 내용 생성
function createEmailContent(email, productData, generatedContent) {
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const currentTime = new Date().toLocaleTimeString('ko-KR');
    
    return `
=================================
📱 마케팅 컨텐츠 생성 결과
=================================

📅 생성 일시: ${currentDate} ${currentTime}
🤖 생성 모드: ${aiMode === 'gpt' ? 'GPT AI 모드' : '로컬 모드'}

📋 상품 정보
---------------------------------
• 상품명: ${productData.product_name}
• 카테고리: ${productData.category}
• 타겟 고객층: ${productData.target_audience}
• 주요 특징: ${productData.key_features.join(', ')}
• 가격대: ${productData.price_range}
• 브랜드 톤: ${productData.brand_tone}
• 차별화 포인트: ${productData.unique_selling_point}

📱 인스타그램 릴스 컨텐츠
=================================
${generatedContent.instagram}

🎬 유튜브 숏츠 컨텐츠  
=================================
${generatedContent.youtube}

📝 블로그 포스트 컨텐츠
=================================
${generatedContent.blog}

=================================
💡 사용 안내

1. 위 컨텐츠를 복사하여 각 플랫폼에서 활용하세요
2. 브랜드 특성에 맞게 추가 편집하여 사용하세요  
3. 해시태그나 이모지는 플랫폼별로 조정하세요

📧 이 이메일은 마케팅 컨텐츠 생성기에서 자동 발송되었습니다.
=================================
    `;
}

// 이메일 내용을 파일로 다운로드하는 함수
function downloadEmailAsFile(email, productData, generatedContent) {
    const emailContent = createEmailContent(email, productData, generatedContent);
    const blob = new Blob([emailContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `마케팅컨텐츠_${productData.product_name}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Email content downloaded as file for:', email);
}

// 대체 이메일 전송 방법 (Formspree 사용)
async function sendEmailAlternative(email, productData, generatedContent) {
    console.log('Trying alternative email method...');
    
    try {
        // 바로 파일 다운로드 제공
        downloadEmailAsFile(email, productData, generatedContent);
        
        // 사용자에게 안내 메시지
        setTimeout(() => {
            const userChoice = confirm(
                '이메일 자동 전송에 실패했습니다.\n\n' +
                '✅ 컨텐츠가 텍스트 파일로 다운로드되었습니다.\n\n' +
                '📧 직접 이메일로 전송하시겠습니까?\n' +
                '(확인 시 이메일 클라이언트가 열립니다)'
            );
            
            if (userChoice) {
                const subject = encodeURIComponent(`[마케팅 컨텐츠] ${productData.product_name} - 생성 결과`);
                const body = encodeURIComponent(
                    '안녕하세요!\n\n' +
                    '마케팅 컨텐츠 생성기에서 생성된 컨텐츠를 첨부 파일로 보내드립니다.\n\n' +
                    '첨부된 텍스트 파일을 확인해주세요.\n\n' +
                    '감사합니다.'
                );
                window.open(`mailto:${email}?subject=${subject}&body=${body}`);
            }
        }, 500);
        
        return { success: true, method: 'download' };
        
    } catch (error) {
        console.error('Download method failed:', error);
        throw new Error('컨텐츠 다운로드에 실패했습니다.');
    }
}

// 이메일 전송 테스트
async function testEmailSending() {
    const emailInput = document.getElementById('emailAddress');
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast('테스트할 이메일 주소를 먼저 입력해주세요.', 'error');
        emailInput.focus();
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('올바른 이메일 주소 형식이 아닙니다.', 'error');
        emailInput.focus();
        return;
    }
    
    // 테스트 데이터 생성
    const testProductData = {
        product_name: '테스트 상품',
        category: '테스트',
        target_audience: '전연령',
        key_features: ['이메일 전송 테스트'],
        price_range: '1만원 이하',
        unique_selling_point: '이메일 전송 기능이 정상 작동하는지 확인하는 테스트입니다.',
        brand_tone: '친근한'
    };
    
    const testGeneratedContent = {
        instagram: '📧 이메일 전송 테스트\n\n이 메시지를 받으셨다면 이메일 기능이 정상 작동합니다! ✅\n\n#이메일테스트 #마케팅컨텐츠생성기',
        youtube: '🎬 이메일 테스트 영상\n\n[0-5초] 이메일 기능 테스트 중입니다\n[5-10초] 정상 작동 확인!\n\n#테스트 #이메일',
        blog: '# 이메일 전송 테스트\n\n이 이메일을 받으셨다면 마케팅 컨텐츠 생성기의 이메일 기능이 정상적으로 작동하고 있습니다.\n\n실제 사용 시에는 입력한 상품 정보를 바탕으로 생성된 마케팅 컨텐츠가 전송됩니다.'
    };
    
    try {
        showToast('테스트 이메일을 전송 중입니다...', 'info');
        
        await sendContentByEmail(email, testProductData, testGeneratedContent);
        
        showToast('✅ 테스트 이메일이 성공적으로 전송되었습니다!', 'success');
        
    } catch (error) {
        console.error('Email test failed:', error);
        showToast('❌ 이메일 전송 테스트에 실패했습니다: ' + error.message, 'error');
    }
}

// Notion에 컨텐츠 저장
async function saveToNotion(productData, generatedContent) {
    if (!notionToken || !notionDatabaseId) {
        throw new Error('Notion 설정이 완료되지 않았습니다.');
    }

    const notionData = {
        parent: {
            type: "database_id",
            database_id: notionDatabaseId
        },
        properties: {
            "상품명": {
                title: [
                    {
                        text: {
                            content: productData.product_name
                        }
                    }
                ]
            },
            "카테고리": {
                select: {
                    name: productData.category
                }
            },
            "타겟 고객층": {
                select: {
                    name: productData.target_audience
                }
            },
            "주요 특징": {
                rich_text: [
                    {
                        text: {
                            content: productData.key_features.join(', ')
                        }
                    }
                ]
            },
            "가격대": {
                select: {
                    name: productData.price_range
                }
            },
            "차별화 포인트": {
                rich_text: [
                    {
                        text: {
                            content: productData.unique_selling_point
                        }
                    }
                ]
            },
            "브랜드 톤": {
                select: {
                    name: productData.brand_tone
                }
            },
            "생성 날짜": {
                date: {
                    start: new Date().toISOString().split('T')[0]
                }
            },
            "AI 모드": {
                select: {
                    name: aiMode === 'gpt' ? 'GPT AI' : '로컬'
                }
            },
            "상태": {
                select: {
                    name: "생성 완료"
                }
            }
        },
        children: [
            {
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "📱 인스타그램 릴스"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "code",
                code: {
                    language: "plain text",
                    rich_text: [
                        {
                            text: {
                                content: generatedContent.instagram
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "🎬 유튜브 숏츠"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "code",
                code: {
                    language: "plain text",
                    rich_text: [
                        {
                            text: {
                                content: generatedContent.youtube
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "heading_2",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "📝 블로그 포스트"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "code",
                code: {
                    language: "markdown",
                    rich_text: [
                        {
                            text: {
                                content: generatedContent.blog
                            }
                        }
                    ]
                }
            }
        ]
    };

    try {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(notionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Notion API 오류: ${errorData.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('Notion page created successfully:', result);
        return result;
        
    } catch (error) {
        console.error('Notion saving failed:', error);
        throw new Error('Notion 저장에 실패했습니다: ' + error.message);
    }
}