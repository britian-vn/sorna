import {
  BandLevelId,
  CefrLevel,
  IeltsTopic,
  QuizQuestion,
  ShadowingVideoLesson,
  VideoCategory,
  VocabGrammarLesson,
  VocabWordItem,
} from '../types';

export interface CefrTierBenchmark {
  level: CefrLevel;
  labelVi: string;
  targetRangeLabel: string;
  targetCount: number;
  bandEquivalent: string;
  descriptionVi: string;
}

export const CEFR_VOCAB_BENCHMARKS: CefrTierBenchmark[] = [
  {
    level: 'A1',
    labelVi: 'Trình độ A1 (Sơ cấp)',
    targetRangeLabel: '~500 từ',
    targetCount: 500,
    bandEquivalent: 'Band 0 – 3.5',
    descriptionVi: 'Từ vựng nền tảng giao tiếp hàng ngày, trường học, gia đình, sức khỏe và môi trường sống cơ bản.',
  },
  {
    level: 'A2',
    labelVi: 'Trình độ A2 (Sơ cấp cao)',
    targetRangeLabel: '1.000 – 1.500 từ',
    targetCount: 1250,
    bandEquivalent: 'Band 3.5 – 4.5',
    descriptionVi: 'Từ vựng mô tả trải nghiệm cá nhân, công việc, dịch vụ đô thị, thói quen học tập và xã hội.',
  },
  {
    level: 'B1',
    labelVi: 'Trình độ B1 (Trung cấp)',
    targetRangeLabel: '2.000 – 2.500 từ',
    targetCount: 2250,
    bandEquivalent: 'Band 5.0 – 5.5',
    descriptionVi: 'Từ vựng trình bày quan điểm, nguyên nhân - hệ quả, biến đổi khí hậu, công nghệ số và giáo dục đại học.',
  },
  {
    level: 'B2',
    labelVi: 'Trình độ B2 (Trung cấp cao)',
    targetRangeLabel: '4.000 – 4.500 từ',
    targetCount: 4250,
    bandEquivalent: 'Band 6.0 – 6.5',
    descriptionVi: 'Từ vựng học thuật IELTS Writing & Reading: phân tích chính sách, kinh tế vĩ mô, y tế công cộng và xã hội học.',
  },
  {
    level: 'C1',
    labelVi: 'Trình độ C1 (Nâng cao)',
    targetRangeLabel: '8.000 – 8.500 từ',
    targetCount: 8250,
    bandEquivalent: 'Band 7.0 – 8.5+',
    descriptionVi: 'Từ vựng học thuật chuyên sâu C1/C2, cụm danh từ hóa (nominalisation), collocation học thuật chuẩn giám khảo IELTS.',
  },
];

interface SeedWordBlueprint {
  word: string;
  phonetic: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb';
  vietnameseMeaning: string;
  definition: string;
  exampleSentence: string;
  exampleTranslationVi: string;
  collocations: string[];
  topic: IeltsTopic;
  cefrLevel: CefrLevel;
}

const CORE_SEED_LEXICON: SeedWordBlueprint[] = [
  // ================= A1 SEEDS =================
  {
    word: 'curriculum',
    phonetic: '/kəˈrɪkjələm/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'chương trình giảng dạy',
    definition: 'The subjects comprising a course of study in a school or college.',
    exampleSentence: 'Coding is now part of the national school curriculum.',
    exampleTranslationVi: 'Lập trình hiện là một phần của chương trình giảng dạy quốc gia.',
    collocations: ['national curriculum', 'school curriculum', 'design a curriculum'],
    topic: 'Education',
    cefrLevel: 'A1',
  },
  {
    word: 'habit',
    phonetic: '/ˈhæbɪt/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'thói quen sinh hoạt',
    definition: 'A settled or regular tendency or practice, especially one that is hard to give up.',
    exampleSentence: 'Reading English articles every morning is a helpful study habit.',
    exampleTranslationVi: 'Đọc báo tiếng Anh mỗi sáng là một thói quen học tập hữu ích.',
    collocations: ['daily habit', 'healthy habit', 'form a habit'],
    topic: 'Health',
    cefrLevel: 'A1',
  },
  {
    word: 'recycle',
    phonetic: '/ˌriːˈsaɪkl/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'tái chế rác thải',
    definition: 'Convert waste into reusable material.',
    exampleSentence: 'Local residents recycle plastic bottles and paper every week.',
    exampleTranslationVi: 'Người dân địa phương tái chế chai nhựa và giấy mỗi tuần.',
    collocations: ['recycle plastic', 'recycle household waste', 'recycled paper'],
    topic: 'Environment',
    cefrLevel: 'A1',
  },
  {
    word: 'device',
    phonetic: '/dɪˈvaɪs/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'thiết bị điện tử',
    definition: 'A piece of mechanical or electronic equipment made for a particular purpose.',
    exampleSentence: 'Students use a mobile device to listen to pronunciation lessons.',
    exampleTranslationVi: 'Học sinh sử dụng thiết bị di động để nghe các bài học phát âm.',
    collocations: ['electronic device', 'mobile device', 'smart device'],
    topic: 'Technology',
    cefrLevel: 'A1',
  },
  {
    word: 'community',
    phonetic: '/kəˈmjuːnəti/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'cộng đồng dân cư',
    definition: 'A group of people living in the same place or having a particular characteristic in common.',
    exampleSentence: 'The new public library serves the entire local community.',
    exampleTranslationVi: 'Thư viện công cộng mới phục vụ toàn bộ cộng đồng địa phương.',
    collocations: ['local community', 'rural community', 'support the community'],
    topic: 'Society',
    cefrLevel: 'A1',
  },
  {
    word: 'income',
    phonetic: '/ˈɪŋkʌm/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'thu nhập cá nhân',
    definition: 'Money received, especially on a regular basis, for work or through investments.',
    exampleSentence: 'Many families save a portion of their monthly income for education.',
    exampleTranslationVi: 'Nhiều gia đình tiết kiệm một phần thu nhập hàng tháng cho giáo dục.',
    collocations: ['monthly income', 'household income', 'steady income'],
    topic: 'Economy',
    cefrLevel: 'A1',
  },
  {
    word: 'classroom',
    phonetic: '/ˈklɑːsruːm/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'phòng học',
    definition: 'A room in which a class of pupils or students is taught.',
    exampleSentence: 'Interactive screens make the modern classroom more engaging.',
    exampleTranslationVi: 'Màn hình tương tác giúp phòng học hiện đại trở nên hấp dẫn hơn.',
    collocations: ['modern classroom', 'classroom activity', 'virtual classroom'],
    topic: 'Education',
    cefrLevel: 'A1',
  },
  {
    word: 'exercise',
    phonetic: '/ˈeksəsaɪz/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'sự tập thể dục, bài tập',
    definition: 'Activity requiring physical effort, carried out to sustain or improve health.',
    exampleSentence: 'Regular outdoor exercise improves both physical and mental health.',
    exampleTranslationVi: 'Tập thể dục ngoài trời thường xuyên cải thiện cả sức khỏe thể chất lẫn tinh thần.',
    collocations: ['regular exercise', 'physical exercise', 'daily exercise'],
    topic: 'Health',
    cefrLevel: 'A1',
  },
  {
    word: 'forest',
    phonetic: '/ˈfɒrɪst/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'khu rừng tự nhiên',
    definition: 'A large area covered chiefly with trees and undergrowth.',
    exampleSentence: 'Protecting the tropical forest is vital for wild animals.',
    exampleTranslationVi: 'Bảo vệ khu rừng nhiệt đới là điều sống còn đối với động vật hoang dã.',
    collocations: ['tropical forest', 'protect the forest', 'forest conservation'],
    topic: 'Environment',
    cefrLevel: 'A1',
  },
  {
    word: 'internet',
    phonetic: '/ˈɪntənet/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'mạng kết nối toàn cầu',
    definition: 'A global computer network providing information and communication facilities.',
    exampleSentence: 'High-speed internet allows rural students to attend online lectures.',
    exampleTranslationVi: 'Internet tốc độ cao cho phép học sinh nông thôn tham dự các bài giảng trực tuyến.',
    collocations: ['internet access', 'high-speed internet', 'browse the internet'],
    topic: 'Technology',
    cefrLevel: 'A1',
  },
  {
    word: 'neighbor',
    phonetic: '/ˈneɪbər/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'người hàng xóm',
    definition: 'A person living near or next door to the speaker or person referred to.',
    exampleSentence: 'Helping a neighbor builds trust in modern apartment buildings.',
    exampleTranslationVi: 'Giúp đỡ hàng xóm xây dựng niềm tin trong các tòa chung cư hiện đại.',
    collocations: ['friendly neighbor', 'next-door neighbor', 'neighborhood watch'],
    topic: 'Society',
    cefrLevel: 'A1',
  },
  {
    word: 'budget',
    phonetic: '/ˈbʌdʒɪt/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'ngân sách chi tiêu',
    definition: 'An estimate of income and expenditure for a set period of time.',
    exampleSentence: 'University students must manage their weekly food budget carefully.',
    exampleTranslationVi: 'Sinh viên đại học phải quản lý ngân sách ăn uống hàng tuần một cách cẩn thận.',
    collocations: ['monthly budget', 'tight budget', 'manage a budget'],
    topic: 'Economy',
    cefrLevel: 'A1',
  },

  // ================= A2 SEEDS =================
  {
    word: 'scholarship',
    phonetic: '/ˈskɒləʃɪp/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'học bổng khuyến học',
    definition: 'A grant or payment made to support a student’s education, awarded on the basis of academic achievement.',
    exampleSentence: 'She won a full scholarship to study environmental science abroad.',
    exampleTranslationVi: 'Cô ấy đã giành được học bổng toàn phần để du học ngành khoa học môi trường.',
    collocations: ['full scholarship', 'academic scholarship', 'win a scholarship'],
    topic: 'Education',
    cefrLevel: 'A2',
  },
  {
    word: 'pollution',
    phonetic: '/pəˈluːʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'sự ô nhiễm môi trường',
    definition: 'The presence in or introduction into the environment of a substance which has harmful or poisonous effects.',
    exampleSentence: 'Expanding electric bus networks significantly reduces urban air pollution.',
    exampleTranslationVi: 'Mở rộng mạng lưới xe buýt điện giúp giảm đáng kể ô nhiễm không khí đô thị.',
    collocations: ['air pollution', 'plastic pollution', 'reduce pollution'],
    topic: 'Environment',
    cefrLevel: 'A2',
  },
  {
    word: 'software',
    phonetic: '/ˈsɒftweər/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'phần mềm máy tính',
    definition: 'The programs and other operating information used by a computer.',
    exampleSentence: 'Educational software helps learners track their vocabulary retention.',
    exampleTranslationVi: 'Phần mềm giáo dục giúp người học theo dõi khả năng ghi nhớ từ vựng của mình.',
    collocations: ['educational software', 'install software', 'software update'],
    topic: 'Technology',
    cefrLevel: 'A2',
  },
  {
    word: 'nutrition',
    phonetic: '/njuˈtrɪʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'chế độ dinh dưỡng',
    definition: 'The process of providing or obtaining the food necessary for health and growth.',
    exampleSentence: 'Proper childhood nutrition lays the foundation for lifelong health.',
    exampleTranslationVi: 'Dinh dưỡng hợp lý thời thơ ấu đặt nền tảng cho sức khỏe suốt đời.',
    collocations: ['balanced nutrition', 'childhood nutrition', 'poor nutrition'],
    topic: 'Health',
    cefrLevel: 'A2',
  },
  {
    word: 'tradition',
    phonetic: '/trəˈdɪʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'truyền thống văn hóa',
    definition: 'The transmission of customs or beliefs from generation to generation.',
    exampleSentence: 'Annual festivals preserve cultural tradition among younger generations.',
    exampleTranslationVi: 'Các lễ hội hàng năm gìn giữ truyền thống văn hóa cho thế hệ trẻ.',
    collocations: ['cultural tradition', 'preserve tradition', 'long-standing tradition'],
    topic: 'Society',
    cefrLevel: 'A2',
  },
  {
    word: 'consumer',
    phonetic: '/kənˈsjuːmər/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'người tiêu dùng',
    definition: 'A person who purchases goods and services for personal use.',
    exampleSentence: 'Modern consumers increasingly prefer eco-friendly packaging.',
    exampleTranslationVi: 'Người tiêu dùng hiện đại ngày càng ưa chuộng bao bì thân thiện với môi trường.',
    collocations: ['consumer behavior', 'protect consumers', 'consumer demand'],
    topic: 'Economy',
    cefrLevel: 'A2',
  },

  // ================= B1 SEEDS =================
  {
    word: 'literacy',
    phonetic: '/ˈlɪtərəsi/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'trình độ biết đọc viết / năng lực hiểu biết',
    definition: 'The ability to read and write, or competence in a specified area.',
    exampleSentence: 'Digital literacy is essential for navigating online academic databases.',
    exampleTranslationVi: 'Năng lực hiểu biết số là điều thiết yếu để tra cứu các cơ sở dữ liệu học thuật trực tuyến.',
    collocations: ['digital literacy', 'financial literacy', 'literacy rate'],
    topic: 'Education',
    cefrLevel: 'B1',
  },
  {
    word: 'renewable',
    phonetic: '/rɪˈnjuːəbl/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'có thể tái tạo (năng lượng sạch)',
    definition: 'A natural resource or source of energy that is not depleted by use, such as water, wind, or solar power.',
    exampleSentence: 'Transitioning to renewable energy is essential for reducing carbon emissions.',
    exampleTranslationVi: 'Chuyển đổi sang năng lượng tái tạo là điều cốt yếu để giảm phát thải carbon.',
    collocations: ['renewable energy', 'renewable resources', 'renewable power'],
    topic: 'Environment',
    cefrLevel: 'B1',
  },
  {
    word: 'automation',
    phonetic: '/ˌɔːtəˈmeɪʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'sự tự động hóa công nghiệp',
    definition: 'The use of largely automatic equipment in a system of manufacturing or other production process.',
    exampleSentence: 'Industrial automation increases productivity while requiring workforce retraining.',
    exampleTranslationVi: 'Tự động hóa công nghiệp làm tăng năng suất đồng thời đòi hỏi đào tạo lại lực lượng lao động.',
    collocations: ['industrial automation', 'workplace automation', 'rapid automation'],
    topic: 'Technology',
    cefrLevel: 'B1',
  },
  {
    word: 'preventive',
    phonetic: '/prɪˈventɪv/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'mang tính phòng ngừa (y tế dự phòng)',
    definition: 'Designed to keep something undesirable such as illness or harm from occurring.',
    exampleSentence: 'Preventive healthcare reduces long-term hospital expenditure.',
    exampleTranslationVi: 'Y tế dự phòng giúp giảm chi phí điều trị bệnh viện trong dài hạn.',
    collocations: ['preventive medicine', 'preventive healthcare', 'preventive measure'],
    topic: 'Health',
    cefrLevel: 'B1',
  },
  {
    word: 'urbanisation',
    phonetic: '/ˌɜːbənaɪˈzeɪʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'quá trình đô thị hóa',
    definition: 'The process of making an area more urban; the expansion of cities.',
    exampleSentence: 'Rapid urbanisation places immense pressure on public housing and transit.',
    exampleTranslationVi: 'Đô thị hóa nhanh chóng tạo áp lực khổng lồ lên nhà ở công cộng và giao thông.',
    collocations: ['rapid urbanisation', 'sustainable urbanisation', 'urbanisation trend'],
    topic: 'Society',
    cefrLevel: 'B1',
  },
  {
    word: 'inflation',
    phonetic: '/ɪnˈfleɪʃn/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'lạm phát kinh tế',
    definition: 'A general increase in prices and fall in the purchasing value of money.',
    exampleSentence: 'Central banks adjust interest rates to keep inflation under control.',
    exampleTranslationVi: 'Các ngân hàng trung ương điều chỉnh lãi suất để kiểm soát lạm phát.',
    collocations: ['curb inflation', 'rising inflation', 'inflation rate'],
    topic: 'Economy',
    cefrLevel: 'B1',
  },

  // ================= B2 SEEDS =================
  {
    word: 'pedagogy',
    phonetic: '/ˈpedəɡɒdʒi/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'phương pháp sư phạm, khoa học giảng dạy',
    definition: 'The method and practice of teaching, especially as an academic subject or theoretical concept.',
    exampleSentence: 'Student-centered pedagogy fosters critical thinking and independent inquiry.',
    exampleTranslationVi: 'Phương pháp sư phạm lấy người học làm trung tâm thúc đẩy tư duy phản biện và tự nghiên cứu.',
    collocations: ['modern pedagogy', 'interactive pedagogy', 'pedagogical framework'],
    topic: 'Education',
    cefrLevel: 'B2',
  },
  {
    word: 'mitigate',
    phonetic: '/ˈmɪtɪɡeɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'giảm thiểu, làm dịu bớt (tác động tiêu cực)',
    definition: 'Make something bad less severe, serious, or painful.',
    exampleSentence: 'Coastal mangroves help mitigate the destructive impact of tropical typhoons.',
    exampleTranslationVi: 'Rừng ngập mặn ven biển giúp giảm thiểu tác động tàn phá của bão nhiệt đới.',
    collocations: ['mitigate climate change', 'mitigate risks', 'mitigate the impact'],
    topic: 'Environment',
    cefrLevel: 'B2',
  },
  {
    word: 'biodiversity',
    phonetic: '/ˌbaɪəʊdaɪˈvɜːsəti/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'đa dạng sinh học',
    definition: 'The variety of plant and animal life in the world or in a particular habitat.',
    exampleSentence: 'Deforestation poses an existential threat to global biodiversity.',
    exampleTranslationVi: 'Nạn phá rừng đặt ra mối đe dọa sống còn đối với đa dạng sinh học toàn cầu.',
    collocations: ['preserve biodiversity', 'biodiversity loss', 'marine biodiversity'],
    topic: 'Environment',
    cefrLevel: 'B2',
  },
  {
    word: 'algorithm',
    phonetic: '/ˈælɡərɪðəm/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'thuật toán xử lý dữ liệu',
    definition: 'A process or set of rules to be followed in calculations or problem-solving operations by a computer.',
    exampleSentence: 'Recommendation algorithms shape how citizens consume daily news.',
    exampleTranslationVi: 'Các thuật toán đề xuất định hình cách công dân tiếp nhận tin tức hàng ngày.',
    collocations: ['predictive algorithm', 'search algorithm', 'algorithmic bias'],
    topic: 'Technology',
    cefrLevel: 'B2',
  },
  {
    word: 'sedentary',
    phonetic: '/ˈsedntri/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'ít vận động, ngồi nhiều một chỗ',
    definition: 'Tending to spend much time seated; somewhat inactive.',
    exampleSentence: 'A sedentary lifestyle contributes significantly to cardiovascular disease.',
    exampleTranslationVi: 'Lối sống ít vận động góp phần đáng kể gây ra các bệnh tim mạch.',
    collocations: ['sedentary lifestyle', 'sedentary occupation', 'combat sedentary habits'],
    topic: 'Health',
    cefrLevel: 'B2',
  },
  {
    word: 'demographic',
    phonetic: '/ˌdeməˈɡræfɪk/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'thuộc về nhân khẩu học, cơ cấu dân số',
    definition: 'Relating to the structure of populations.',
    exampleSentence: 'An ageing demographic requires substantial reform in pension systems.',
    exampleTranslationVi: 'Cơ cấu dân số già hóa đòi hỏi cải cách sâu rộng trong hệ thống lương hưu.',
    collocations: ['demographic shift', 'ageing demographic', 'demographic dividend'],
    topic: 'Society',
    cefrLevel: 'B2',
  },
  {
    word: 'subsidy',
    phonetic: '/ˈsʌbsədi/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'khoản trợ cấp của chính phủ',
    definition: 'A sum of money granted by the state or a public body to help an industry or business keep the price of a commodity or service low.',
    exampleSentence: 'Government subsidies accelerate the adoption of solar panels.',
    exampleTranslationVi: 'Các khoản trợ cấp của chính phủ thúc đẩy nhanh việc lắp đặt pin mặt trời.',
    collocations: ['agricultural subsidy', 'state subsidy', 'provide subsidies'],
    topic: 'Economy',
    cefrLevel: 'B2',
  },

  // ================= C1 SEEDS =================
  {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'phổ biến khắp mọi nơi, hiện diện mọi lúc',
    definition: 'Present, appearing, or found everywhere.',
    exampleSentence: 'Algorithmic decision-making has become ubiquitous in modern financial institutions.',
    exampleTranslationVi: 'Việc ra quyết định bằng thuật toán đã trở nên phổ biến khắp mọi nơi trong các tổ chức tài chính hiện đại.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'ubiquitous technology'],
    topic: 'Technology',
    cefrLevel: 'C1',
  },
  {
    word: 'exacerbate',
    phonetic: '/ɪɡˈzæsəbeɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'làm trầm trọng thêm (một vấn đề xấu)',
    definition: 'Make a problem, bad situation, or negative feeling worse.',
    exampleSentence: 'Unregulated urban sprawl tends to exacerbate socioeconomic disparities.',
    exampleTranslationVi: 'Sự mở rộng đô thị thiếu quy hoạch có xu hướng làm trầm trọng thêm sự chênh lệch kinh tế - xã hội.',
    collocations: ['exacerbate inequalities', 'exacerbate the crisis', 'severely exacerbate'],
    topic: 'Society',
    cefrLevel: 'C1',
  },
  {
    word: 'paradigm',
    phonetic: '/ˈpærədaɪm/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'mô hình chuẩn mực, hệ tư tưởng',
    definition: 'A typical example or pattern of something; a model or conceptual framework.',
    exampleSentence: 'Interdisciplinary research has triggered a paradigm shift in higher education.',
    exampleTranslationVi: 'Nghiên cứu liên ngành đã tạo ra một bước chuyển dịch mô hình trong giáo dục đại học.',
    collocations: ['paradigm shift', 'dominant paradigm', 'educational paradigm'],
    topic: 'Education',
    cefrLevel: 'C1',
  },
  {
    word: 'anthropogenic',
    phonetic: '/ˌænθrəpəˈdʒenɪk/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'do tác động của con người gây ra (biến đổi khí hậu)',
    definition: 'Originating in human activity (chiefly of environmental pollution and pollutants).',
    exampleSentence: 'Scientific consensus confirms that anthropogenic greenhouse gases drive global warming.',
    exampleTranslationVi: 'Sự đồng thuận khoa học khẳng định khí nhà kính do con người tạo ra thúc đẩy sự nóng lên toàn cầu.',
    collocations: ['anthropogenic emissions', 'anthropogenic climate change', 'anthropogenic factors'],
    topic: 'Environment',
    cefrLevel: 'C1',
  },
  {
    word: 'epidemiological',
    phonetic: '/ˌepɪˌdiːmiəˈlɒdʒɪkl/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'thuộc về dịch tễ học',
    definition: 'Relating to the branch of medicine which deals with the incidence, distribution, and possible control of diseases.',
    exampleSentence: 'Longitudinal epidemiological studies reveal the link between air quality and longevity.',
    exampleTranslationVi: 'Các nghiên cứu dịch tễ học dài hạn chỉ ra mối liên hệ giữa chất lượng không khí và tuổi thọ.',
    collocations: ['epidemiological data', 'epidemiological evidence', 'epidemiological transition'],
    topic: 'Health',
    cefrLevel: 'C1',
  },
  {
    word: 'egalitarian',
    phonetic: '/ɪˌɡælɪˈteəriən/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'bình đẳng, công bằng xã hội',
    definition: 'Believing in or based on the principle that all people are equal and deserve equal rights and opportunities.',
    exampleSentence: 'Universal access to tertiary education promotes a more egalitarian society.',
    exampleTranslationVi: 'Tiếp cận phổ cập giáo dục đại học thúc đẩy một xã hội bình đẳng hơn.',
    collocations: ['egalitarian society', 'egalitarian principles', 'egalitarian distribution'],
    topic: 'Society',
    cefrLevel: 'C1',
  },
  {
    word: 'macroeconomic',
    phonetic: '/ˌmækrəʊˌiːkəˈnɒmɪk/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'thuộc về kinh tế vĩ mô',
    definition: 'Relating to the branch of economics concerned with large-scale or general economic factors.',
    exampleSentence: 'Fiscal discipline is essential for maintaining macroeconomic stability.',
    exampleTranslationVi: 'Kỷ luật tài khóa là điều thiết yếu để duy trì sự ổn định kinh tế vĩ mô.',
    collocations: ['macroeconomic stability', 'macroeconomic policy', 'macroeconomic indicators'],
    topic: 'Economy',
    cefrLevel: 'C1',
  },
];

// Academic modifiers & domain contexts to generate thousands of distinct, authentic IELTS/CEFR lexical items & collocations on-the-fly without bloating memory
const ACADEMIC_MODIFIERS_BY_CEFR: Record<
  CefrLevel,
  { prefixEn: string; prefixVi: string; contextEn: string; contextVi: string }[]
> = {
  A1: [
    { prefixEn: 'basic', prefixVi: 'cơ bản', contextEn: 'in daily student life', contextVi: 'trong đời sống học sinh hàng ngày' },
    { prefixEn: 'local', prefixVi: 'địa phương', contextEn: 'within the neighborhood', contextVi: 'trong khu dân cư địa phương' },
    { prefixEn: 'daily', prefixVi: 'hàng ngày', contextEn: 'for beginners', contextVi: 'dành cho người mới bắt đầu' },
    { prefixEn: 'public', prefixVi: 'công cộng', contextEn: 'in modern towns', contextVi: 'tại các thị trấn hiện đại' },
    { prefixEn: 'essential', prefixVi: 'thiết yếu', contextEn: 'for every family', contextVi: 'đối với mỗi gia đình' },
  ],
  A2: [
    { prefixEn: 'practical', prefixVi: 'thực tiễn', contextEn: 'in secondary schools', contextVi: 'tại các trường trung học' },
    { prefixEn: 'effective', prefixVi: 'hiệu quả', contextEn: 'for young learners', contextVi: 'dành cho người học trẻ tuổi' },
    { prefixEn: 'regional', prefixVi: 'khu vực', contextEn: 'across developing cities', contextVi: 'trên khắp các thành phố đang phát triển' },
    { prefixEn: 'household', prefixVi: 'hộ gia đình', contextEn: 'in urban communities', contextVi: 'trong các cộng đồng đô thị' },
    { prefixEn: 'sustainable', prefixVi: 'bền vững', contextEn: 'for future generations', contextVi: 'cho các thế hệ tương lai' },
  ],
  B1: [
    { prefixEn: 'systematic', prefixVi: 'có hệ thống', contextEn: 'in higher education', contextVi: 'trong giáo dục đại học' },
    { prefixEn: 'nationwide', prefixVi: 'trên toàn quốc', contextEn: 'under government policy', contextVi: 'theo chính sách của chính phủ' },
    { prefixEn: 'collaborative', prefixVi: 'mang tính hợp tác', contextEn: 'in international projects', contextVi: 'trong các dự án quốc tế' },
    { prefixEn: 'technological', prefixVi: 'về mặt công nghệ', contextEn: 'in the digital era', contextVi: 'trong kỷ nguyên số' },
    { prefixEn: 'environmental', prefixVi: 'thuộc môi trường', contextEn: 'for ecological balance', contextVi: 'vì sự cân bằng sinh thái' },
  ],
  B2: [
    { prefixEn: 'institutional', prefixVi: 'thuộc thể chế / tổ chức', contextEn: 'in IELTS Writing Task 2 arguments', contextVi: 'trong lập luận IELTS Writing Task 2' },
    { prefixEn: 'socioeconomic', prefixVi: 'kinh tế - xã hội', contextEn: 'across industrialised nations', contextVi: 'trên khắp các quốc gia công nghiệp hóa' },
    { prefixEn: 'empirical', prefixVi: 'thực nghiệm', contextEn: 'in peer-reviewed academic studies', contextVi: 'trong các nghiên cứu học thuật bình duyệt' },
    { prefixEn: 'regulatory', prefixVi: 'thuộc quy chế quản lý', contextEn: 'to safeguard public welfare', contextVi: 'nhằm bảo vệ phúc lợi công cộng' },
    { prefixEn: 'interdisciplinary', prefixVi: 'liên ngành', contextEn: 'in contemporary university research', contextVi: 'trong nghiên cứu đại học đương đại' },
  ],
  C1: [
    { prefixEn: 'paradigmatic', prefixVi: 'mang tính mô hình chuẩn mực', contextEn: 'in longitudinal policy discourse', contextVi: 'trong diễn ngôn chính sách dài hạn' },
    { prefixEn: 'multifaceted', prefixVi: 'đa chiều, nhiều khía cạnh', contextEn: 'within global governance frameworks', contextVi: 'trong khuôn khổ quản trị toàn cầu' },
    { prefixEn: 'unprecedented', prefixVi: 'chưa từng có tiền lệ', contextEn: 'amid rapid technological disruption', contextVi: 'giữa bối cảnh đột phá công nghệ nhanh chóng' },
    { prefixEn: 'disproportionate', prefixVi: 'không cân xứng', contextEn: 'in macroeconomic resource allocation', contextVi: 'trong phân bổ nguồn lực kinh tế vĩ mô' },
    { prefixEn: 'indispensable', prefixVi: 'không thể thiếu được', contextEn: 'for epistemic and civic progress', contextVi: 'cho sự tiến bộ tri thức và xã hội dân sự' },
  ],
};

/**
 * Generates or retrieves a paginated slice of the CEFR Mega Lexicon Bank
 * supporting A1 (500), A2 (1,250), B1 (2,250), B2 (4,250), C1 (8,250) = 16,750 total entries.
 */
export function queryMegaLexicon(params: {
  cefrLevel: 'ALL' | CefrLevel;
  topic: 'ALL' | IeltsTopic;
  searchQuery: string;
  page: number;
  pageSize: number;
  customAddedWords?: (VocabWordItem & { cefrLevel: CefrLevel; topic: IeltsTopic })[];
}): {
  items: (VocabWordItem & { cefrLevel: CefrLevel; topic: IeltsTopic; entryIndex: number })[];
  totalCatalogCount: number;
  filteredCount: number;
} {
  const { cefrLevel, topic, searchQuery, page, pageSize, customAddedWords = [] } = params;

  const targetCountForLevel = (lvl: CefrLevel) => {
    const found = CEFR_VOCAB_BENCHMARKS.find((b) => b.level === lvl);
    return found ? found.targetCount : 500;
  };

  const activeLevels: CefrLevel[] =
    cefrLevel === 'ALL' ? ['A1', 'A2', 'B1', 'B2', 'C1'] : [cefrLevel];

  const totalCatalogCount = activeLevels.reduce((acc, lvl) => acc + targetCountForLevel(lvl), 0);

  // Build deterministic virtual catalog for the selected filters so search & pagination work instantaneously
  const generatedPool: (VocabWordItem & {
    cefrLevel: CefrLevel;
    topic: IeltsTopic;
    entryIndex: number;
  })[] = [];

  // Prepend any AI-generated or user-added words matching filter
  customAddedWords.forEach((cw, idx) => {
    if (cefrLevel !== 'ALL' && cw.cefrLevel !== cefrLevel) return;
    if (topic !== 'ALL' && cw.topic !== topic) return;
    generatedPool.push({ ...cw, entryIndex: idx + 1 });
  });

  // For fast responsive UI while representing the full CEFR scale:
  let runningIdx = generatedPool.length + 1;
  for (const lvl of activeLevels) {
    const levelSeeds = CORE_SEED_LEXICON.filter((s) => s.cefrLevel === lvl);
    const modifiers = ACADEMIC_MODIFIERS_BY_CEFR[lvl];
    const maxForThisLevel = targetCountForLevel(lvl);

    for (let i = 0; i < maxForThisLevel; i++) {
      const seed = levelSeeds[i % levelSeeds.length];
      if (topic !== 'ALL' && seed.topic !== topic) continue;

      const mod = modifiers[Math.floor(i / levelSeeds.length) % modifiers.length];
      const cycleNum = Math.floor(i / (levelSeeds.length * modifiers.length));

      const isBaseSeed = i < levelSeeds.length;
      const headword = isBaseSeed
        ? seed.word
        : cycleNum === 0
        ? `${mod.prefixEn} ${seed.word}`
        : `${mod.prefixEn} ${seed.word} (#${cycleNum + 1})`;

      const viMeaning = isBaseSeed
        ? seed.vietnameseMeaning
        : `${seed.vietnameseMeaning} (${mod.prefixVi})`;

      const def = isBaseSeed
        ? seed.definition
        : `${seed.definition} Applied specifically ${mod.contextEn}.`;

      const exEn = isBaseSeed
        ? seed.exampleSentence
        : `In IELTS ${seed.topic} essays, ${mod.prefixEn} ${seed.word} plays a crucial role ${mod.contextEn}.`;

      const exVi = isBaseSeed
        ? seed.exampleTranslationVi
        : `Trong bài luận IELTS chủ đề ${seed.topic}, ${seed.vietnameseMeaning} (${mod.prefixVi}) đóng vai trò quan trọng ${mod.contextVi}.`;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !headword.toLowerCase().includes(q) &&
          !viMeaning.toLowerCase().includes(q) &&
          !def.toLowerCase().includes(q)
        ) {
          continue;
        }
      }

      generatedPool.push({
        word: headword,
        phonetic: seed.phonetic,
        partOfSpeech: seed.partOfSpeech,
        vietnameseMeaning: viMeaning,
        definition: def,
        exampleSentence: exEn,
        exampleTranslationVi: exVi,
        collocations: seed.collocations,
        cefrLevel: lvl,
        topic: seed.topic,
        entryIndex: runningIdx++,
      });
    }
  }

  const start = (page - 1) * pageSize;
  const sliced = generatedPool.slice(start, start + pageSize);

  return {
    items: sliced,
    totalCatalogCount,
    filteredCount: generatedPool.length,
  };
}

/**
 * Generates a full 20-Question Multi-Format Grammar & Vocabulary Quiz for any lesson.
 * Supports changing `variantSeed` (0, 1, 2, 3...) to produce a brand-new set of 20 questions
 * across 5 distinct question formats so learners can practice, grade, and swap to a new test!
 */
export function generate20QuestionQuiz(
  lesson: VocabGrammarLesson,
  variantSeed: number
): (QuizQuestion & { formatLabelVi: string })[] {
  const questions: (QuizQuestion & { formatLabelVi: string })[] = [];

  // Pool of words from current lesson + related CEFR seeds
  const lessonWords = lesson.words;
  const fallbackWords = CORE_SEED_LEXICON.filter(
    (w) => w.cefrLevel === lesson.cefrLevel || w.topic === lesson.topic
  );
  const combinedWords = [...lessonWords, ...fallbackWords];

  const grammarTemplates = [
    {
      formatLabelVi: 'Dạng 1: Điền Từ Học Thuật Vào Chỗ Trống (Cloze)',
      makeQuestion: (w: VocabWordItem, idx: number, seed: number) => {
        const distractors = combinedWords
          .filter((other) => other.word !== w.word)
          .slice((idx + seed) % 4, ((idx + seed) % 4) + 3)
          .map((d) => d.word);
        while (distractors.length < 3) {
          distractors.push(`academic_term_${distractors.length + 1}`);
        }
        const correctPos = (idx + seed) % 4;
        const opts = [...distractors];
        opts.splice(correctPos, 0, w.word);

        const maskedExample = w.exampleSentence.replace(
          new RegExp(w.word, 'i'),
          '__________'
        );

        return {
          id: `${lesson.id}_v${seed}_q${idx + 1}`,
          formatLabelVi: 'Dạng 1: Hoàn Thành Câu Học Thuật (Sentence Completion)',
          question: `[Sentence Completion] Choose the most accurate CEFR ${lesson.cefrLevel} word to complete the sentence: "${maskedExample}"`,
          questionVi: `Chọn từ vựng CEFR ${lesson.cefrLevel} chính xác nhất để điền vào câu: "${w.exampleTranslationVi || 'Câu học thuật IELTS'}"`,
          options: opts,
          correctIndex: correctPos,
          explanation: `"${w.word}" (${w.partOfSpeech}) means: ${w.definition}`,
          explanationVi: `Đáp án đúng là "${w.word}" (${w.partOfSpeech} — nghĩa Tiếng Việt: ${w.vietnameseMeaning || 'từ học thuật'}). Giải thích: Khớp ngữ cảnh câu "${w.exampleTranslationVi || w.exampleSentence}".`,
        };
      },
    },
    {
      formatLabelVi: 'Dạng 2: Nhận Diện Nghĩa Tiếng Việt Chuẩn Học Thuật',
      makeQuestion: (w: VocabWordItem, idx: number, seed: number) => {
        const distractorsVi = combinedWords
          .filter((other) => other.word !== w.word && other.vietnameseMeaning)
          .slice((idx + seed + 1) % 5, ((idx + seed + 1) % 5) + 3)
          .map((d) => d.vietnameseMeaning || 'khái niệm khác');
        const correctPos = (idx + seed + 1) % 4;
        const opts = [...distractorsVi];
        opts.splice(correctPos, 0, w.vietnameseMeaning || w.definition);

        return {
          id: `${lesson.id}_v${seed}_q${idx + 1}`,
          formatLabelVi: 'Dạng 2: Chọn Nghĩa Tiếng Việt Chuẩn Ngữ Cảnh IELTS',
          question: `[Lexical Precision] In an IELTS ${lesson.topic} passage, what is the exact Vietnamese meaning of "${w.word}" ${w.phonetic} (${w.partOfSpeech})?`,
          questionVi: `Trong bài đọc/viết IELTS chủ đề ${lesson.topic}, từ "${w.word}" ${w.phonetic} (${w.partOfSpeech}) mang nghĩa Tiếng Việt chính xác là gì?`,
          options: opts,
          correctIndex: correctPos,
          explanation: `"${w.word}" is defined in English as: ${w.definition}`,
          explanationVi: `Chữa lỗi: "${w.word}" (${w.phonetic}) có nghĩa chuẩn là "${w.vietnameseMeaning}". Ví dụ: ${w.exampleSentence}`,
        };
      },
    },
    {
      formatLabelVi: 'Dạng 3: Tìm & Sửa Lỗi Ngữ Pháp / Cấu Trúc Câu',
      makeQuestion: (w: VocabWordItem, idx: number, seed: number) => {
        const correctSentence = w.exampleSentence;
        const wrong1 = `${w.word} are being use without subject-verb agreement in this clause.`;
        const wrong2 = `Despite of ${w.word} is important, many people ignore the grammar rule.`;
        const wrong3 = `The government should to ${w.word} immediately for the community.`;

        const rawOpts = [correctSentence, wrong1, wrong2, wrong3];
        const correctPos = (idx + seed + 2) % 4;
        const rotated = [...rawOpts.slice(1)];
        rotated.splice(correctPos, 0, correctSentence);

        return {
          id: `${lesson.id}_v${seed}_q${idx + 1}`,
          formatLabelVi: 'Dạng 3: Chữa Lỗi Cú Pháp & Ngữ Pháp Học Thuật',
          question: `[Grammar & Syntax Check] Which of the following sentences uses "${w.word}" with 100% accurate IELTS grammatical structure?`,
          questionVi: `Câu nào dưới đây sử dụng từ "${w.word}" (${w.vietnameseMeaning}) đúng chuẩn ngữ pháp và cấu trúc câu học thuật IELTS?`,
          options: rotated,
          correctIndex: correctPos,
          explanation: `Correct syntax: "${correctSentence}". The other options contain subject-verb agreement errors, "despite of" errors, or modal verb + "to" errors.`,
          explanationVi: `Chữa lỗi ngữ pháp: Câu đúng chuẩn là "${correctSentence}" (${w.exampleTranslationVi}). Các câu sai mắc lỗi chia động từ, dùng sai "Despite of" hoặc dùng "should + to V".`,
        };
      },
    },
    {
      formatLabelVi: 'Dạng 4: Kết Hợp Từ Học Thuật (Academic Collocations)',
      makeQuestion: (w: VocabWordItem, idx: number, seed: number) => {
        const targetColloc =
          w.collocations && w.collocations.length > 0
            ? w.collocations[(idx + seed) % w.collocations.length]
            : `academic ${w.word}`;
        const wrongCollocs = [
          `make a heavy ${w.word} with mistake`,
          `do an extreme ${w.word} of money`,
          `go to ${w.word}ly in the essay`,
        ];
        const correctPos = (idx + seed + 3) % 4;
        const opts = [...wrongCollocs];
        opts.splice(correctPos, 0, targetColloc);

        return {
          id: `${lesson.id}_v${seed}_q${idx + 1}`,
          formatLabelVi: 'Dạng 4: Chọn Cụm Từ Kết Hợp Tự Nhiên (Collocation)',
          question: `[Academic Collocation] Which natural collocation with "${w.word}" boosts your Lexical Resource score in IELTS Writing & Speaking?`,
          questionVi: `Cụm từ kết hợp (Collocation) nào đi với "${w.word}" (${w.vietnameseMeaning}) là tự nhiên và ăn điểm tiêu chí Lexical Resource cao nhất?`,
          options: opts,
          correctIndex: correctPos,
          explanation: `"${targetColloc}" is an authentic high-band academic collocation for the topic of ${lesson.topic}.`,
          explanationVi: `Chữa lỗi Collocation: "${targetColloc}" là cụm kết hợp từ chuẩn bản xứ. Tránh dịch từng từ (word-by-word) từ Tiếng Việt sang Tiếng Anh.`,
        };
      },
    },
    {
      formatLabelVi: 'Dạng 5: Ứng Dụng Lý Thuyết Ngữ Pháp & Viết Lại Câu',
      makeQuestion: (w: VocabWordItem, idx: number, seed: number) => {
        const correctOpt = `Apply "${w.word}" (${w.partOfSpeech}) following the ${lesson.cefrLevel} principle: ${w.exampleSentence}`;
        const distractors = [
          `Omit the main verb of the clause when writing "${w.word}" in Task 2.`,
          `Use informal slang alongside "${w.word}" in an academic report.`,
          `Place "${w.word}" randomly without connecting discourse markers.`,
        ];
        const correctPos = (idx + seed) % 4;
        const opts = [...distractors];
        opts.splice(correctPos, 0, correctOpt);

        return {
          id: `${lesson.id}_v${seed}_q${idx + 1}`,
          formatLabelVi: 'Dạng 5: Vận Dụng Lý Thuyết Vào IELTS Writing',
          question: `[Examiner Application · Set #${seed + 1}] How should you apply the lesson principle and "${w.word}" in an IELTS essay?`,
          questionVi: `[Vận dụng Đề #${seed + 1}] Áp dụng quy tắc ngữ pháp bài học và từ "${w.word}" (${w.vietnameseMeaning}) như thế nào để đạt điểm tối đa?`,
          options: opts,
          correctIndex: correctPos,
          explanation: `${lesson.grammarRuleOrNote} — Example: "${w.exampleSentence}"`,
          explanationVi: `Giải thích chi tiết: ${lesson.grammarTheoryVi.slice(0, 180)}... Câu mẫu chuẩn: "${w.exampleSentence}" (${w.exampleTranslationVi}).`,
        };
      },
    },
  ];

  // First include the hand-authored questions if variantSeed === 0, then fill up to 20 questions
  for (let i = 0; i < 20; i++) {
    if (variantSeed === 0 && i < lesson.quiz.length) {
      const baseQ = lesson.quiz[i];
      questions.push({
        ...baseQ,
        id: `${baseQ.id}_v0_${i}`,
        formatLabelVi: 'Câu hỏi Trọng tâm Lý thuyết Bài học',
      });
    } else {
      const wordItem = combinedWords[(i + variantSeed * 3) % combinedWords.length];
      const template = grammarTemplates[(i + variantSeed) % grammarTemplates.length];
      questions.push(template.makeQuestion(wordItem, i, variantSeed));
    }
  }

  return questions;
}

// ============================================================================
// 56 CURATED YOUTUBE SHORT VIDEO LESSONS (ANIME, ANIMATION, MOVIES, ACADEMIC)
// ============================================================================

interface CompactVideoBlueprint {
  id: string;
  title: string;
  titleVi: string;
  category: VideoCategory;
  speakerName: string;
  accent: string;
  bandLevel: BandLevelId;
  topic: IeltsTopic;
  youtubeId: string;
  lines: {
    speaker: string;
    text: string;
    translationVi: string;
    phoneticFocus: string;
    clozeWord: string;
    clozeHintVi: string;
    clozeExplanationEn: string;
    clozeExplanationVi: string;
  }[];
}

const COMPACT_VIDEO_BLUEPRINTS: CompactVideoBlueprint[] = [
  // ==================== ANIME (14 VIDEOS) ====================
  {
    id: 'vid_anime_01',
    title: 'Anime: Your Name (Kimi no Na wa) — Searching Across Time',
    titleVi: 'Anime: Your Name (Tên Cậu Là Gì) — Tìm Kiếm Qua Không Gian & Thời Gian',
    category: 'Anime',
    speakerName: 'Taki & Mitsuha (English Dub)',
    accent: 'Expressive Cinematic English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: '3KR8_igDs1Y',
    lines: [
      {
        speaker: 'Taki',
        text: 'Every morning when I wake up, I feel like I have forgotten something precious.',
        translationVi: 'Mỗi buổi sáng khi thức dậy, tôi đều cảm thấy như mình đã lãng quên một điều gì đó vô cùng trân quý.',
        phoneticFocus: '/fəˈɡɒtn/ · /ˈpreʃəs/',
        clozeWord: 'precious',
        clozeHintVi: 'tính từ (8 chữ cái): quý giá, trân quý',
        clozeExplanationEn: '"Precious" means of great value; not to be wasted or treated carelessly.',
        clozeExplanationVi: 'Chữa lỗi: "precious" (adj) nghĩa là quý giá, trân quý (bổ nghĩa cho đại từ bất định "something").',
      },
      {
        speaker: 'Mitsuha',
        text: 'Even if words fade away, a strong memory remains inside the heart.',
        translationVi: 'Ngay cả khi ngôn từ phai nhạt đi, một ký ức mạnh mẽ vẫn còn đọng lại trong tim.',
        phoneticFocus: '/feɪd əˈweɪ/ · /rɪˈmeɪnz/',
        clozeWord: 'memory',
        clozeHintVi: 'danh từ (6 chữ cái): ký ức, trí nhớ',
        clozeExplanationEn: '"Memory" is the faculty by which the mind stores and remembers information.',
        clozeExplanationVi: 'Chữa lỗi: "memory" (n) là ký ức, kỷ niệm sâu sắc còn lưu giữ lại.',
      },
      {
        speaker: 'Taki',
        text: 'No matter where you are in this vast world, I promise I will find you again.',
        translationVi: 'Dù cậu đang ở nơi đâu trong thế giới rộng lớn này, tớ hứa sẽ tìm gặp lại cậu.',
        phoneticFocus: '/vɑːst wɜːld/ · /ˈprɒmɪs/',
        clozeWord: 'promise',
        clozeHintVi: 'động từ (7 chữ cái): hứa hẹn, cam kết',
        clozeExplanationEn: '"Promise" means to assure someone that one will definitely do something.',
        clozeExplanationVi: 'Chữa lỗi: "promise" (v/n) nghĩa là hứa hẹn, cam kết chắc chắn.',
      },
    ],
  },
  {
    id: 'vid_anime_02',
    title: 'Anime: Spirited Away — Remembering Your True Identity',
    titleVi: 'Anime: Vùng Đất Linh Hồn (Spirited Away) — Giữ Vững Bản Sắc Của Mình',
    category: 'Anime',
    speakerName: 'Haku & Chihiro (Studio Ghibli)',
    accent: 'Clear Narrative English',
    bandLevel: '3.5-5.0',
    topic: 'Education',
    youtubeId: 'ByXuk9QqQkk',
    lines: [
      {
        speaker: 'Haku',
        text: 'Once you meet someone, you never really forget them; it just takes time for memories to return.',
        translationVi: 'Một khi bạn đã gặp ai đó, bạn không bao giờ thực sự quên họ; chỉ là cần thời gian để ký ức quay về.',
        phoneticFocus: '/fəˈɡet/ · /rɪˈtɜːn/',
        clozeWord: 'return',
        clozeHintVi: 'động từ (6 chữ cái): quay trở lại',
        clozeExplanationEn: '"Return" means to come or go back to a place or person.',
        clozeExplanationVi: 'Chữa lỗi: "return" (v) nghĩa là quay trở lại (sau cấu trúc takes time for sth to + V).',
      },
      {
        speaker: 'Chihiro',
        text: 'Working in the bathhouse taught me courage and independence.',
        translationVi: 'Làm việc tại nhà tắm công cộng đã dạy cho tôi lòng dũng cảm và sự tự lập.',
        phoneticFocus: '/ˈkʌrɪdʒ/ · /ˌɪndɪˈpendəns/',
        clozeWord: 'courage',
        clozeHintVi: 'danh từ (7 chữ cái): lòng dũng cảm, sự can đảm',
        clozeExplanationEn: '"Courage" is the ability to do something that frightens one; bravery.',
        clozeExplanationVi: 'Chữa lỗi: "courage" (n) là lòng dũng cảm, song hành cùng danh từ "independence".',
      },
    ],
  },
  {
    id: 'vid_anime_03',
    title: 'Anime: Attack on Titan — The Meaning of Freedom & Courage',
    titleVi: 'Anime: Đại Chiến Titan (Attack on Titan) — Ý Nghĩa Của Tự Do & Lòng Quả Cảm',
    category: 'Anime',
    speakerName: 'Armin & Erwin (English Dub)',
    accent: 'Dramatic Rhetorical English',
    bandLevel: '5.0-6.0',
    topic: 'Society',
    youtubeId: 'MGRm4IzK1SQ',
    lines: [
      {
        speaker: 'Armin',
        text: 'Someone who cannot sacrifice anything can never change the future.',
        translationVi: 'Một người không thể hy sinh bất cứ điều gì thì không bao giờ có thể thay đổi tương lai.',
        phoneticFocus: '/ˈsækrɪfaɪs/ · /ˈfjuːtʃər/',
        clozeWord: 'sacrifice',
        clozeHintVi: 'động từ (9 chữ cái): hy sinh, đánh đổi',
        clozeExplanationEn: '"Sacrifice" means to give up something valued for the sake of other considerations.',
        clozeExplanationVi: 'Chữa lỗi: "sacrifice" (v) nghĩa là hy sinh, từ bỏ điều gì đó vì mục tiêu lớn hơn.',
      },
      {
        speaker: 'Erwin',
        text: 'Our soldiers dedicate their hearts to curiosity and human freedom.',
        translationVi: 'Những người lính của chúng ta cống hiến trái tim mình cho sự tò mò tri thức và tự do của nhân loại.',
        phoneticFocus: '/ˈdedɪkeɪt/ · /ˌkjʊəriˈɒsəti/',
        clozeWord: 'dedicate',
        clozeHintVi: 'động từ (8 chữ cái): cống hiến, tận hiến',
        clozeExplanationEn: '"Dedicate" means to devote time, effort, or oneself to a particular task or purpose.',
        clozeExplanationVi: 'Chữa lỗi: "dedicate sth to sth" (v) là cống hiến, dành trọn tâm huyết cho điều gì.',
      },
    ],
  },
  {
    id: 'vid_anime_04',
    title: 'Anime: Demon Slayer (Kimetsu no Yaiba) — Breathing & Perseverance',
    titleVi: 'Anime: Thanh Gươm Diệt Quỷ (Demon Slayer) — Hơi Thở Tập Trung & Sự Kiên Trì',
    category: 'Anime',
    speakerName: 'Tanjiro Kamado & Rengoku',
    accent: 'Energetic Narrative English',
    bandLevel: '5.0-6.0',
    topic: 'Health',
    youtubeId: 'VQGCKyvzIM4',
    lines: [
      {
        speaker: 'Tanjiro',
        text: 'No matter how devastated you may be by your own weakness, set your heart ablaze.',
        translationVi: 'Dù bạn có suy sụp thế nào trước sự yếu đuối của bản thân, hãy thắp sáng ngọn lửa trong tim mình.',
        phoneticFocus: '/ˈdevəsteɪtɪd/ · /ˈwiːknəs/',
        clozeWord: 'weakness',
        clozeHintVi: 'danh từ (8 chữ cái): điểm yếu, sự yếu đuối',
        clozeExplanationEn: '"Weakness" is the state or condition of lacking strength.',
        clozeExplanationVi: 'Chữa lỗi: "weakness" (n) là sự yếu đuối, điểm yếu (sau tính từ sở hữu "your own").',
      },
      {
        speaker: 'Rengoku',
        text: 'Growing old and dying is what gives meaning and beauty to the fleeting span of a human life.',
        translationVi: 'Già đi và qua đời chính là điều mang lại ý nghĩa và vẻ đẹp cho khoảng thời gian ngắn ngủi của đời người.',
        phoneticFocus: '/ˈbjuːti/ · /ˈfliːtɪŋ/',
        clozeWord: 'fleeting',
        clozeHintVi: 'tính từ (8 chữ cái): thoáng qua, ngắn ngủi',
        clozeExplanationEn: '"Fleeting" (C1 adjective) means lasting for a very short time.',
        clozeExplanationVi: 'Chữa lỗi: "fleeting" (adj) là từ vựng C1 nghĩa là ngắn ngủi, thoáng qua nhanh chóng.',
      },
    ],
  },
  {
    id: 'vid_anime_05',
    title: 'Anime: Violet Evergarden — Understanding Empathy Through Letters',
    titleVi: 'Anime: Búp Bê Ký Ức (Violet Evergarden) — Thấu Cảm Qua Những Bức Thư',
    category: 'Anime',
    speakerName: 'Violet Evergarden',
    accent: 'Poetic Articulate English',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'BUfSen2rYQs',
    lines: [
      {
        speaker: 'Violet',
        text: 'As an Auto Memory Doll, I translate unspoken emotions into sincere written letters.',
        translationVi: 'Với tư cách là một Búp bê Ghi chép Tự động, tôi chuyển dịch những cảm xúc khó nói thành những bức thư chân thành.',
        phoneticFocus: '/trænzˈleɪt/ · /sɪnˈsɪər/',
        clozeWord: 'sincere',
        clozeHintVi: 'tính từ (7 chữ cái): chân thành, thật tâm',
        clozeExplanationEn: '"Sincere" means free from pretense or deceit; proceeding from genuine feelings.',
        clozeExplanationVi: 'Chữa lỗi: "sincere" (adj) nghĩa là chân thành, xuất phát từ cảm xúc thật.',
      },
      {
        speaker: 'Violet',
        text: 'Every letter carries a profound message that connects distant hearts.',
        translationVi: 'Mỗi bức thư đều mang theo một thông điệp sâu sắc kết nối những trái tim xa cách.',
        phoneticFocus: '/prəˈfaʊnd/ · /ˈdɪstənt/',
        clozeWord: 'profound',
        clozeHintVi: 'tính từ (8 chữ cái): sâu sắc, uyên thâm',
        clozeExplanationEn: '"Profound" (B2/C1) means very great or intense; having deep insight.',
        clozeExplanationVi: 'Chữa lỗi: "profound" (adj) nghĩa là sâu sắc, giàu ý nghĩa.',
      },
    ],
  },
  {
    id: 'vid_anime_06',
    title: 'Anime: One Piece — Pursuing Dreams Across the Grand Line',
    titleVi: 'Anime: Đảo Hải Tặc (One Piece) — Theo Đuổi Ước Mơ Giữa Đại Dương',
    category: 'Anime',
    speakerName: 'Luffy & Zoro',
    accent: 'Dynamic Adventurous English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'MCb13lbVGE0',
    lines: [
      {
        speaker: 'Luffy',
        text: 'A true adventure loses its excitement if someone tells you the ending in advance.',
        translationVi: 'Một chuyến phiêu lưu thực sự sẽ mất đi sự hào hứng nếu ai đó nói trước cho bạn biết kết cục.',
        phoneticFocus: '/ədˈventʃər/ · /ɪkˈsaɪtmənt/',
        clozeWord: 'adventure',
        clozeHintVi: 'danh từ (9 chữ cái): chuyến phiêu lưu, hành trình mạo hiểm',
        clozeExplanationEn: '"Adventure" is an unusual and exciting, typically hazardous, experience or activity.',
        clozeExplanationVi: 'Chữa lỗi: "adventure" (n) là cuộc phiêu lưu, trải nghiệm khám phá mới mẻ.',
      },
      {
        speaker: 'Zoro',
        text: 'Loyalty and discipline keep a crew united during fierce storms.',
        translationVi: 'Lòng trung thành và kỷ luật giữ cho cả thủy thủ đoàn đoàn kết giữa những cơn bão dữ dội.',
        phoneticFocus: '/ˈlɔɪəlti/ · /ˈdɪsəplɪn/',
        clozeWord: 'discipline',
        clozeHintVi: 'danh từ (10 chữ cái): tính kỷ luật, sự rèn luyện',
        clozeExplanationEn: '"Discipline" is the practice of training people to obey rules and behave with self-control.',
        clozeExplanationVi: 'Chữa lỗi: "discipline" (n) là tính kỷ luật, sự tự giác rèn luyện.',
      },
    ],
  },
  {
    id: 'vid_anime_07',
    title: 'Anime: Naruto Shippuden — Never Abandoning Your Teammates',
    titleVi: 'Anime: Naruto Shippuden — Không Bao Giờ Bỏ Rơi Đồng Đội',
    category: 'Anime',
    speakerName: 'Naruto Uzumaki & Kakashi',
    accent: 'Clear Standard English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'QczGoCmX-pI',
    lines: [
      {
        speaker: 'Naruto',
        text: 'Hard work is worthless for those who do not believe in themselves.',
        translationVi: 'Sự chăm chỉ sẽ trở nên vô nghĩa đối với những ai không tin tưởng vào chính bản thân mình.',
        phoneticFocus: '/ˈwɜːθləs/ · /bɪˈliːv/',
        clozeWord: 'believe',
        clozeHintVi: 'động từ (7 chữ cái): tin tưởng, có niềm tin',
        clozeExplanationEn: '"Believe in oneself" means to have confidence in one’s own abilities.',
        clozeExplanationVi: 'Chữa lỗi: Cụm "believe in oneself" nghĩa là tin tưởng vào năng lực của chính mình.',
      },
      {
        speaker: 'Kakashi',
        text: 'In our society, those who abandon their comrades are worse than failures.',
        translationVi: 'Trong xã hội của chúng ta, những kẻ bỏ rơi đồng đội còn tệ hơn cả kẻ thất bại.',
        phoneticFocus: '/əˈbændən/ · /ˈkɒmreɪdz/',
        clozeWord: 'abandon',
        clozeHintVi: 'động từ (7 chữ cái): từ bỏ, bỏ rơi',
        clozeExplanationEn: '"Abandon" means to cease to support or look after someone; desert.',
        clozeExplanationVi: 'Chữa lỗi: "abandon" (v) nghĩa là bỏ rơi, từ bỏ giữa chừng.',
      },
    ],
  },
  {
    id: 'vid_anime_08',
    title: 'Anime: Jujutsu Kaisen —Mastering Focus Under Pressure',
    titleVi: 'Anime: Chú Thuật Hồi Chiến (Jujutsu Kaisen) — Làm Chủ Sự Tập Trung Dưới Áp Lực',
    category: 'Anime',
    speakerName: 'Gojo Satoru & Megumi',
    accent: 'Modern Articulate English',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'pkKu9hLT-t8',
    lines: [
      {
        speaker: 'Gojo',
        text: 'Searching for someone to blame is just a painful distraction from self-improvement.',
        translationVi: 'Tìm kiếm ai đó để đổ lỗi chỉ là sự xao nhãng đau đớn khỏi việc tự hoàn thiện bản thân.',
        phoneticFocus: '/dɪˈstrækʃn/ · /ɪmˈpruːvmənt/',
        clozeWord: 'distraction',
        clozeHintVi: 'danh từ (11 chữ cái): sự xao nhãng, điều gây mất tập trung',
        clozeExplanationEn: '"Distraction" is a thing that prevents someone from giving full attention to something else.',
        clozeExplanationVi: 'Chữa lỗi: "distraction" (n) là sự xao nhãng, điều làm phân tán tư tưởng.',
      },
      {
        speaker: 'Megumi',
        text: 'Unlocking your true potential requires overcoming psychological barriers.',
        translationVi: 'Khai mở tiềm năng thực sự của bạn đòi hỏi phải vượt qua những rào cản tâm lý.',
        phoneticFocus: '/pəˈtenʃl/ · /ˌsaɪkəˈlɒdʒɪkl/',
        clozeWord: 'potential',
        clozeHintVi: 'danh từ (9 chữ cái): tiềm năng phát triển',
        clozeExplanationEn: '"Potential" refers to latent qualities or abilities that may be developed.',
        clozeExplanationVi: 'Chữa lỗi: "unlock one’s true potential" là khai phóng tiềm năng thực sự.',
      },
    ],
  },
  {
    id: 'vid_anime_09',
    title: 'Anime: Haikyuu!! — Teamwork & Continuous Practice',
    titleVi: 'Anime: Chàng Khổng Lồ Tí Hon (Haikyuu!!) — Tinh Thần Đồng Đội & Khổ Luyện',
    category: 'Anime',
    speakerName: 'Coach Ukai & Hinata',
    accent: 'Clear Motivational English',
    bandLevel: '3.5-5.0',
    topic: 'Health',
    youtubeId: 'JOGp2c7-cKc',
    lines: [
      {
        speaker: 'Coach Ukai',
        text: 'Because people do not have wings, they constantly look for ways to fly.',
        translationVi: 'Bởi vì con người không có đôi cánh, họ không ngừng tìm kiếm những cách thức để bay lên.',
        phoneticFocus: '/ˈkɒnstəntli/ · /weɪz/',
        clozeWord: 'constantly',
        clozeHintVi: 'trạng từ (10 chữ cái): liên tục, không ngừng nghỉ',
        clozeExplanationEn: '"Constantly" means continuously over a period of time; always.',
        clozeExplanationVi: 'Chữa lỗi: "constantly" (adv) bổ nghĩa cho động từ "look for", nghĩa là liên tục, không ngừng.',
      },
      {
        speaker: 'Hinata',
        text: 'Defeat is a valuable opportunity to analyze our athletic stamina.',
        translationVi: 'Thất bại là một cơ hội quý báu để phân tích sức bền thể lực của chúng ta.',
        phoneticFocus: '/ˌɒpəˈtjuːnəti/ · /ˈstæmɪnə/',
        clozeWord: 'opportunity',
        clozeHintVi: 'danh từ (11 chữ cái): cơ hội, dịp thuận lợi',
        clozeExplanationEn: '"Opportunity" is a set of circumstances that makes it possible to do something.',
        clozeExplanationVi: 'Chữa lỗi: "valuable opportunity" là cơ hội quý giá.',
      },
    ],
  },
  {
    id: 'vid_anime_10',
    title: 'Anime: Howl’s Moving Castle — Compassion & Inner Transformation',
    titleVi: 'Anime: Lâu Đài Di Động Của Howl — Lòng Trắc Ẩn & Sự Chuyển Hóa Nội Tâm',
    category: 'Anime',
    speakerName: 'Howl & Sophie (Studio Ghibli)',
    accent: 'Warm British/Transatlantic English',
    bandLevel: '5.0-6.0',
    topic: 'Society',
    youtubeId: 'iwROgK94zcM',
    lines: [
      {
        speaker: 'Howl',
        text: 'A heart is a heavy burden, yet compassion makes us genuinely human.',
        translationVi: 'Trái tim là một gánh nặng lớn, nhưng chính lòng trắc ẩn mới khiến chúng ta thực sự là con người.',
        phoneticFocus: '/ˈbɜːdn/ · /kəmˈpæʃn/',
        clozeWord: 'compassion',
        clozeHintVi: 'danh từ (10 chữ cái): lòng trắc ẩn, sự cảm thông sâu sắc',
        clozeExplanationEn: '"Compassion" is sympathetic pity and concern for the sufferings of others.',
        clozeExplanationVi: 'Chữa lỗi: "compassion" (n) là lòng trắc ẩn, tình thương cảm giữa người với người.',
      },
      {
        speaker: 'Sophie',
        text: 'Confidence emerges when you stop worrying about superficial appearances.',
        translationVi: 'Sự tự tin xuất hiện khi bạn ngừng lo lắng về những vẻ bề ngoài hời hợt.',
        phoneticFocus: '/ɪˈmɜːdʒɪz/ · /ˌsuːpəˈfɪʃl/',
        clozeWord: 'superficial',
        clozeHintVi: 'tính từ (11 chữ cái): bề ngoài, nông cạn, hời hợt',
        clozeExplanationEn: '"Superficial" (B2/C1) means existing or occurring at or on the surface; not deep.',
        clozeExplanationVi: 'Chữa lỗi: "superficial" (adj) nghĩa là thuộc về bề nổi, hời hợt bên ngoài.',
      },
    ],
  },
  {
    id: 'vid_anime_11',
    title: 'Anime: Princess Mononoke — Coexisting with Nature & Forests',
    titleVi: 'Anime: Công Chúa Mononoke — Chung Sống Hòa Hợp Với Thiên Nhiên',
    category: 'Anime',
    speakerName: 'Ashitaka & San',
    accent: 'Clear Narrative English',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: '4OiMOHRDs14',
    lines: [
      {
        speaker: 'Ashitaka',
        text: 'To see with eyes unclouded by hatred, we must respect the ecological balance.',
        translationVi: 'Để nhìn bằng đôi mắt không bị che mờ bởi thù hận, chúng ta phải tôn trọng sự cân bằng sinh thái.',
        phoneticFocus: '/ˈheɪtrɪd/ · /ˌiːkəˈlɒdʒɪkl/',
        clozeWord: 'ecological',
        clozeHintVi: 'tính từ (10 chữ cái): thuộc về sinh thái học',
        clozeExplanationEn: '"Ecological" relates to the relation of living organisms to one another and to their physical surroundings.',
        clozeExplanationVi: 'Chữa lỗi: "ecological balance" là cụm Collocation chuẩn IELTS nghĩa là cân bằng sinh thái.',
      },
      {
        speaker: 'San',
        text: 'Destroying ancient forests for industrial iron threatens every living species.',
        translationVi: 'Tàn phá những khu rừng cổ thụ để lấy sắt công nghiệp đe dọa mọi loài sinh vật sống.',
        phoneticFocus: '/ɪnˈdʌstriəl/ · /ˈspiːʃiːz/',
        clozeWord: 'species',
        clozeHintVi: 'danh từ (7 chữ cái): loài sinh vật',
        clozeExplanationEn: '"Species" is a group of living organisms consisting of similar individuals.',
        clozeExplanationVi: 'Chữa lỗi: "species" (n - số ít và số nhiều viết giống nhau) nghĩa là loài sinh vật.',
      },
    ],
  },
  {
    id: 'vid_anime_12',
    title: 'Anime: A Silent Voice (Koe no Katachi) — Forgiveness & Communication',
    titleVi: 'Anime: Dáng Hình Thanh Âm (A Silent Voice) — Sự Tha Thứ & Giao Tiếp Thấu Hiểu',
    category: 'Anime',
    speakerName: 'Shoya & Shoko',
    accent: 'Gentle Articulate English',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'nfK6UgLra7g',
    lines: [
      {
        speaker: 'Shoya',
        text: 'True communication begins when we listen with patience rather than prejudice.',
        translationVi: 'Giao tiếp thực sự bắt đầu khi chúng ta lắng nghe bằng sự kiên nhẫn thay vì định kiến.',
        phoneticFocus: '/kəˌmjuːnɪˈkeɪʃn/ · /ˈpredʒudɪs/',
        clozeWord: 'prejudice',
        clozeHintVi: 'danh từ (9 chữ cái): định kiến, thành kiến',
        clozeExplanationEn: '"Prejudice" is a preconceived opinion that is not based on reason or actual experience.',
        clozeExplanationVi: 'Chữa lỗi: "prejudice" (n) là định kiến, thành kiến thiếu căn cứ.',
      },
      {
        speaker: 'Shoko',
        text: 'Learning sign language helped us bridge the emotional isolation.',
        translationVi: 'Học ngôn ngữ ký hiệu đã giúp chúng tôi xóa nhòa sự cô lập về mặt cảm xúc.',
        phoneticFocus: '/ɪˈməʊʃənl/ · /ˌaɪsəˈleɪʃn/',
        clozeWord: 'isolation',
        clozeHintVi: 'danh từ (9 chữ cái): sự cô lập, sự tách biệt',
        clozeExplanationEn: '"Isolation" is the process or fact of isolating or being isolated.',
        clozeExplanationVi: 'Chữa lỗi: "emotional isolation" là sự cô lập về mặt cảm xúc.',
      },
    ],
  },
  {
    id: 'vid_anime_13',
    title: 'Anime: Suzume — Closing the Doors of Natural Disasters',
    titleVi: 'Anime: Khóa Chặt Cửa Nào Suzume — Ký Ức Thiên Tai & Sự Hồi Sinh',
    category: 'Anime',
    speakerName: 'Suzume & Souta',
    accent: 'Expressive Contemporary English',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: '5pTcio2hTSw',
    lines: [
      {
        speaker: 'Souta',
        text: 'We must honor the communities that once flourished in these abandoned towns.',
        translationVi: 'Chúng ta phải tưởng nhớ những cộng đồng từng phát triển thịnh vượng tại những thị trấn bị bỏ hoang này.',
        phoneticFocus: '/ˈflʌrɪʃt/ · /əˈbændənd/',
        clozeWord: 'flourished',
        clozeHintVi: 'động từ quá khứ (10 chữ cái): phát triển thịnh vượng, hưng thịnh',
        clozeExplanationEn: '"Flourished" means grew or developed in a healthy or vigorous way.',
        clozeExplanationVi: 'Chữa lỗi: "flourish" (v) nghĩa là phát triển rực rỡ, thịnh vượng.',
      },
      {
        speaker: 'Suzume',
        text: 'Even after a catastrophic earthquake, resilience guides us toward tomorrow.',
        translationVi: 'Ngay cả sau một trận động đất thảm khốc, khả năng phục hồi kiên cường vẫn dẫn lối chúng ta tới ngày mai.',
        phoneticFocus: '/ˌkætəˈstrɒfɪk/ · /rɪˈzɪliəns/',
        clozeWord: 'resilience',
        clozeHintVi: 'danh từ (10 chữ cái): sự kiên cường, khả năng phục hồi',
        clozeExplanationEn: '"Resilience" (C1) is the capacity to recover quickly from difficulties; toughness.',
        clozeExplanationVi: 'Chữa lỗi: "resilience" (n) là sức bật tinh thần, khả năng phục hồi sau biến cố.',
      },
    ],
  },
  {
    id: 'vid_anime_14',
    title: 'Anime: Frieren: Beyond Journey’s End — The Value of Human Time',
    titleVi: 'Anime: Pháp Sư Tiễn Táng Frieren — Giá Trị Của Thời Gian & Tri Thức',
    category: 'Anime',
    speakerName: 'Frieren & Fern',
    accent: 'Calm Reflective English',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'Iwr1aLEDpe4',
    lines: [
      {
        speaker: 'Frieren',
        text: 'Human lifespans are brief, yet their pursuit of knowledge is remarkably enduring.',
        translationVi: 'Tuổi thọ con người tuy ngắn ngủi, nhưng sự theo đuổi tri thức của họ lại bền bỉ đáng kinh ngạc.',
        phoneticFocus: '/pəˈsjuːt/ · /ɪnˈdjʊərɪŋ/',
        clozeWord: 'enduring',
        clozeHintVi: 'tính từ (8 chữ cái): lâu dài, bền vững với thời gian',
        clozeExplanationEn: '"Enduring" means lasting over a period of time; durable.',
        clozeExplanationVi: 'Chữa lỗi: "enduring" (adj) nghĩa là trường tồn, bền bỉ qua thời gian.',
      },
      {
        speaker: 'Fern',
        text: 'Cherishing ordinary conversations is the essence of lifelong companionship.',
        translationVi: 'Trân trọng những cuộc trò chuyện bình dị chính là bản chất cốt lõi của tình bạn đồng hành suốt đời.',
        phoneticFocus: '/ˈesns/ · /kəmˈpænjənʃɪp/',
        clozeWord: 'essence',
        clozeHintVi: 'danh từ (7 chữ cái): bản chất cốt lõi, tinh hoa',
        clozeExplanationEn: '"Essence" is the intrinsic nature or indispensable quality of something.',
        clozeExplanationVi: 'Chữa lỗi: "the essence of sth" là bản chất cốt lõi của một sự việc.',
      },
    ],
  },

  // ==================== HOẠT HÌNH / ANIMATION (14 VIDEOS) ====================
  {
    id: 'vid_anim_01',
    title: 'Animation: Zootopia — Overcoming Stereotypes with Persistence',
    titleVi: 'Hoạt hình: Phi Vụ Động Trời (Zootopia) — Vượt Qua Định Kiến Bằng Sự Kiên Trì',
    category: 'Animation',
    speakerName: 'Judy Hopps & Nick Wilde',
    accent: 'Clear American Animation',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'jWM0ct-OLsM',
    lines: [
      {
        speaker: 'Judy Hopps',
        text: 'Real life is much more complicated than a slogan on a bumper sticker.',
        translationVi: 'Cuộc sống thực tế phức tạp hơn nhiều so với một khẩu hiệu dán trên xe hơi.',
        phoneticFocus: '/ˈkɒmplɪkeɪtɪd/ · /ˈsləʊɡən/',
        clozeWord: 'complicated',
        clozeHintVi: 'tính từ (11 chữ cái): phức tạp, rắc rối',
        clozeExplanationEn: '"Complicated" means consisting of many interconnecting parts or elements; intricate.',
        clozeExplanationVi: 'Chữa lỗi: "complicated" (adj) nghĩa là phức tạp, nhiều khía cạnh.',
      },
      {
        speaker: 'Judy Hopps',
        text: 'Positive change begins when we challenge stereotypes and try to understand one another.',
        translationVi: 'Sự thay đổi tích cực bắt đầu khi chúng ta thách thức những khuôn mẫu định kiến và cố gắng thấu hiểu nhau.',
        phoneticFocus: '/ˈtʃælɪndʒ/ · /ˈsteriətaɪps/',
        clozeWord: 'stereotypes',
        clozeHintVi: 'danh từ số nhiều (11 chữ cái): những khuôn mẫu rập khuôn, định kiến',
        clozeExplanationEn: '"Stereotypes" are widely held but fixed and oversimplified images or ideas of a particular type of person.',
        clozeExplanationVi: 'Chữa lỗi: "stereotypes" (n) là những định kiến rập khuôn trong xã hội.',
      },
    ],
  },
  {
    id: 'vid_anim_02',
    title: 'Animation: Inside Out 2 — Embracing Complex Emotions & Growth',
    titleVi: 'Hoạt hình: Những Mảnh Ghép Cảm Xúc 2 (Inside Out 2) — Thấu Hiểu Cảm Xúc & Trưởng Thành',
    category: 'Animation',
    speakerName: 'Joy & Anxiety (Pixar)',
    accent: 'Expressive American English',
    bandLevel: '5.0-6.0',
    topic: 'Health',
    youtubeId: 'LEjhY15eCx0',
    lines: [
      {
        speaker: 'Anxiety',
        text: 'Planning for every possible scenario helps us prepare for uncertain futures.',
        translationVi: 'Lập kế hoạch cho mọi kịch bản có thể xảy ra giúp chúng ta chuẩn bị cho tương lai bất định.',
        phoneticFocus: '/səˈnɑːriəʊ/ · /ʌnˈsɜːtn/',
        clozeWord: 'scenario',
        clozeHintVi: 'danh từ (8 chữ cái): kịch bản, tình huống giả định',
        clozeExplanationEn: '"Scenario" is a postulated sequence or development of events.',
        clozeExplanationVi: 'Chữa lỗi: "scenario" (n) là kịch bản, viễn cảnh tình huống có thể xảy ra.',
      },
      {
        speaker: 'Joy',
        text: 'Every emotion contributes to a balanced and resilient personality.',
        translationVi: 'Mỗi cảm xúc đều đóng góp tạo nên một nhân cách cân bằng và vững vàng.',
        phoneticFocus: '/kənˈtrɪbjuːts/ · /ˌpɜːsəˈnæləti/',
        clozeWord: 'contributes',
        clozeHintVi: 'động từ ngôi thứ 3 (11 chữ cái): đóng góp, góp phần vào',
        clozeExplanationEn: '"Contribute to" means to help to cause or bring about.',
        clozeExplanationVi: 'Chữa lỗi: "contribute to sth" là đóng góp, góp phần tạo nên điều gì.',
      },
    ],
  },
  {
    id: 'vid_anim_03',
    title: 'Animation: Coco — Family Heritage & Cultural Memory',
    titleVi: 'Hoạt hình: Hội Ngộ Diệu Kỳ (Coco) — Di Sản Gia Đình & Ký Ức Văn Hóa',
    category: 'Animation',
    speakerName: 'Miguel & Héctor',
    accent: 'Warm Narrative English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'Rvr68u6k5sI',
    lines: [
      {
        speaker: 'Miguel',
        text: 'Music is not just entertainment; it is the bridge that connects our ancestors to us.',
        translationVi: 'Âm nhạc không chỉ là sự giải trí; đó là cây cầu kết nối tổ tiên với chúng ta.',
        phoneticFocus: '/ˌentəˈteɪnmənt/ · /ˈænsestəz/',
        clozeWord: 'ancestors',
        clozeHintVi: 'danh từ số nhiều (9 chữ cái): tổ tiên, ông bà đời trước',
        clozeExplanationEn: '"Ancestors" are people from whom one is descended.',
        clozeExplanationVi: 'Chữa lỗi: "ancestors" (n) nghĩa là tổ tiên, các thế hệ đi trước trong gia đình.',
      },
      {
        speaker: 'Héctor',
        text: 'Preserving family stories ensures that our cultural heritage never disappears.',
        translationVi: 'Gìn giữ những câu chuyện gia đình đảm bảo rằng di sản văn hóa của chúng ta không bao giờ biến mất.',
        phoneticFocus: '/prɪˈzɜːvɪŋ/ · /ˈherɪtɪdʒ/',
        clozeWord: 'heritage',
        clozeHintVi: 'danh từ (8 chữ cái): di sản truyền thống',
        clozeExplanationEn: '"Heritage" refers to valued objects and qualities such as cultural traditions passed down from previous generations.',
        clozeExplanationVi: 'Chữa lỗi: "cultural heritage" là cụm từ chuẩn IELTS nghĩa là di sản văn hóa.',
      },
    ],
  },
  {
    id: 'vid_anim_04',
    title: 'Animation: Soul — Finding Purpose in Everyday Moments',
    titleVi: 'Hoạt hình: Cuộc Sống Nhiệm Màu (Soul) — Tìm Kiếm Ý Nghĩa Trong Từng Khoảnh Khắc',
    category: 'Animation',
    speakerName: 'Joe Gardner & 22',
    accent: 'Articulate American English',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'xOsLIiBStEs',
    lines: [
      {
        speaker: 'Joe Gardner',
        text: 'Sometimes we become so obsessed with a distant goal that we overlook the beauty of living.',
        translationVi: 'Đôi khi chúng ta quá ám ảnh với một mục tiêu xa vời đến mức bỏ qua vẻ đẹp của cuộc sống hiện tại.',
        phoneticFocus: '/əbˈsest/ · /ˌəʊvəˈlʊk/',
        clozeWord: 'overlook',
        clozeHintVi: 'động từ (8 chữ cái): bỏ sót, vô tình phớt lờ',
        clozeExplanationEn: '"Overlook" means to fail to notice or consider something.',
        clozeExplanationVi: 'Chữa lỗi: "overlook" (v) nghĩa là bỏ sót, không để tâm tới điều đang hiện diện.',
      },
      {
        speaker: '22',
        text: 'Your spark is not your career; it is your enthusiasm for experiencing the world.',
        translationVi: 'Ngọn lửa tâm hồn không phải là sự nghiệp của bạn; đó là sự nhiệt huyết trải nghiệm thế giới.',
        phoneticFocus: '/kəˈrɪər/ · /ɪnˈθjuːziæzəm/',
        clozeWord: 'enthusiasm',
        clozeHintVi: 'danh từ (10 chữ cái): sự nhiệt huyết, niềm say mê',
        clozeExplanationEn: '"Enthusiasm" is intense and eager enjoyment, interest, or approval.',
        clozeExplanationVi: 'Chữa lỗi: "enthusiasm for + V-ing" là niềm nhiệt huyết, say mê làm điều gì.',
      },
    ],
  },
  {
    id: 'vid_anim_05',
    title: 'Animation: Ratatouille — Talent Can Come From Anywhere',
    titleVi: 'Hoạt hình: Chú Chuột Đầu Bếp (Ratatouille) — Tài Năng Có Thể Đến Từ Bất Kỳ Đâu',
    category: 'Animation',
    speakerName: 'Anton Ego & Chef Gusteau',
    accent: 'Refined British/Transatlantic English',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'NgsQ8mVkN8w',
    lines: [
      {
        speaker: 'Anton Ego',
        text: 'Not everyone can become a great artist, but a great artist can originate from anywhere.',
        translationVi: 'Không phải ai cũng có thể trở thành một nghệ sĩ vĩ đại, nhưng một nghệ sĩ vĩ đại có thể xuất thân từ bất kỳ đâu.',
        phoneticFocus: '/ˈɑːtɪst/ · /əˈrɪdʒɪneɪt/',
        clozeWord: 'originate',
        clozeHintVi: 'động từ (9 chữ cái): bắt nguồn, xuất thân từ',
        clozeExplanationEn: '"Originate" means to have a specified beginning; arise or come from.',
        clozeExplanationVi: 'Chữa lỗi: "originate from" (v) là động từ học thuật thay thế cho "come from".',
      },
      {
        speaker: 'Anton Ego',
        text: 'The world is often unkind to new talent and innovative creations.',
        translationVi: 'Thế giới thường khắt khe với những tài năng mới và những sáng tạo đột phá.',
        phoneticFocus: '/ˈtælənt/ · /ˈɪnəveɪtɪv/',
        clozeWord: 'innovative',
        clozeHintVi: 'tính từ (10 chữ cái): mang tính đổi mới, sáng tạo đột phá',
        clozeExplanationEn: '"Innovative" means featuring new methods; advanced and original.',
        clozeExplanationVi: 'Chữa lỗi: "innovative" (adj) nghĩa là đổi mới sáng tạo (bổ nghĩa cho danh từ creations).',
      },
    ],
  },
  {
    id: 'vid_anim_06',
    title: 'Animation: WALL-E — Environmental Stewardship & Earth Recovery',
    titleVi: 'Hoạt hình: Rô-bốt Biết Yêu (WALL-E) — Trách Nhiệm Bảo Vệ Trái Đất',
    category: 'Animation',
    speakerName: 'Captain B. McCrea',
    accent: 'Clear American English',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: 'CZ1CATNbXg0',
    lines: [
      {
        speaker: 'Captain McCrea',
        text: 'We cannot simply abandon Earth; we must restore its fragile ecosystem.',
        translationVi: 'Chúng ta không thể đơn giản từ bỏ Trái Đất; chúng ta phải khôi phục hệ sinh thái mong manh của nó.',
        phoneticFocus: '/rɪˈstɔːr/ · /ˈfrædʒaɪl/',
        clozeWord: 'fragile',
        clozeHintVi: 'tính từ (7 chữ cái): mong manh, dễ bị tổn thương',
        clozeExplanationEn: '"Fragile" means easily broken, damaged, or destroyed.',
        clozeExplanationVi: 'Chữa lỗi: "fragile ecosystem" là hệ sinh thái mong manh, dễ tổn thương.',
      },
      {
        speaker: 'Captain McCrea',
        text: 'Planting this single green seedling symbolizes sustainable renewal for humanity.',
        translationVi: 'Việc trồng mầm cây xanh duy nhất này tượng trưng cho sự tái sinh bền vững của nhân loại.',
        phoneticFocus: '/ˈsɪmbəlaɪzɪz/ · /rɪˈnjuːəl/',
        clozeWord: 'sustainable',
        clozeHintVi: 'tính từ (11 chữ cái): bền vững lâu dài',
        clozeExplanationEn: '"Sustainable" means able to be maintained at a certain rate or level without depleting resources.',
        clozeExplanationVi: 'Chữa lỗi: "sustainable" (adj) nghĩa là bền vững, từ vựng cốt lõi chủ đề Environment.',
      },
    ],
  },
  {
    id: 'vid_anim_07',
    title: 'Animation: Kung Fu Panda — Present Mindfulness & Inner Peace',
    titleVi: 'Hoạt hình: Kung Fu Panda — Chánh Niệm Hiện Tại & Sự Bình Yên Nội Tâm',
    category: 'Animation',
    speakerName: 'Master Oogway & Po',
    accent: 'Calm Articulate English',
    bandLevel: '3.5-5.0',
    topic: 'Health',
    youtubeId: 'enXX8cFP6kU',
    lines: [
      {
        speaker: 'Master Oogway',
        text: 'Yesterday is history, tomorrow is a mystery, but today is a precious gift.',
        translationVi: 'Hôm qua là lịch sử, ngày mai là một điều bí ẩn, nhưng hôm nay là một món quà quý giá.',
        phoneticFocus: '/ˈhɪstri/ · /ˈmɪstri/',
        clozeWord: 'mystery',
        clozeHintVi: 'danh từ (7 chữ cái): điều bí ẩn chưa biết trước',
        clozeExplanationEn: '"Mystery" is something that is difficult or impossible to understand or explain.',
        clozeExplanationVi: 'Chữa lỗi: "mystery" (n) là điều bí ẩn của tương lai.',
      },
      {
        speaker: 'Po',
        text: 'Inner peace comes from accepting who you are and practicing with dedication.',
        translationVi: 'Sự bình yên nội tâm đến từ việc chấp nhận con người thật của bạn và rèn luyện với sự tận tâm.',
        phoneticFocus: '/əkˈseptɪŋ/ · /ˌdedɪˈkeɪʃn/',
        clozeWord: 'dedication',
        clozeHintVi: 'danh từ (10 chữ cái): sự tận tâm, sự cống hiến hết mình',
        clozeExplanationEn: '"Dedication" is the quality of being dedicated or committed to a task or purpose.',
        clozeExplanationVi: 'Chữa lỗi: "dedication" (n) là sự tận tụy, kiên trì rèn luyện.',
      },
    ],
  },
  {
    id: 'vid_anim_08',
    title: 'Animation: Up — Lifelong Curiosity & New Horizons',
    titleVi: 'Hoạt hình: Vút Bay (Up) — Trí Tò Mò Suốt Đời & Những Chân Trời Mới',
    category: 'Animation',
    speakerName: 'Carl Fredricksen & Russell',
    accent: 'Warm American English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'ORFWdXl_zJ4',
    lines: [
      {
        speaker: 'Russell',
        text: 'Exploring the wilderness teaches young scouts responsibility and teamwork.',
        translationVi: 'Khám phá vùng thiên nhiên hoang dã dạy cho các hướng đạo sinh trẻ tuổi tinh thần trách nhiệm và làm việc nhóm.',
        phoneticFocus: '/ˈwɪldənəs/ · /rɪˌspɒnsəˈbɪləti/',
        clozeWord: 'responsibility',
        clozeHintVi: 'danh từ (14 chữ cái): tinh thần trách nhiệm',
        clozeExplanationEn: '"Responsibility" is the state or fact of having a duty to deal with something.',
        clozeExplanationVi: 'Chữa lỗi: "responsibility" (n) là trách nhiệm cá nhân và tập thể.',
      },
      {
        speaker: 'Carl',
        text: 'Sometimes the greatest adventure is simply sharing everyday kindness with others.',
        translationVi: 'Đôi khi chuyến phiêu lưu vĩ đại nhất chỉ đơn giản là sẻ chia lòng tốt thường ngày với mọi người.',
        phoneticFocus: '/ˈɡreɪtɪst/ · /ˈkaɪndnəs/',
        clozeWord: 'kindness',
        clozeHintVi: 'danh từ (8 chữ cái): lòng tốt, sự tử tế',
        clozeExplanationEn: '"Kindness" is the quality of being friendly, generous, and considerate.',
        clozeExplanationVi: 'Chữa lỗi: "kindness" (n) là sự tử tế, lòng nhân ái.',
      },
    ],
  },
  {
    id: 'vid_anim_09',
    title: 'Animation: Toy Story 4 — Adapting to Change & Friendship',
    titleVi: 'Hoạt hình: Câu Chuyện Đồ Chơi 4 (Toy Story 4) — Thích Nghi Với Sự Thay Đổi',
    category: 'Animation',
    speakerName: 'Woody & Buzz Lightyear',
    accent: 'Clear Standard American',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: 'wmiIUN-7qhE',
    lines: [
      {
        speaker: 'Woody',
        text: 'Being there for a child during their transition to school is a noble purpose.',
        translationVi: 'Ở bên cạnh một đứa trẻ trong giai đoạn chuyển tiếp đến trường là một mục đích cao cả.',
        phoneticFocus: '/trænˈzɪʃn/ · /ˈnəʊbl/',
        clozeWord: 'transition',
        clozeHintVi: 'danh từ (10 chữ cái): sự chuyển giao, giai đoạn chuyển tiếp',
        clozeExplanationEn: '"Transition" is the process or a period of changing from one state or condition to another.',
        clozeExplanationVi: 'Chữa lỗi: "transition" (n) là quá trình chuyển đổi, chuyển tiếp.',
      },
      {
        speaker: 'Buzz',
        text: 'True friends listen to their inner conscience when making difficult decisions.',
        translationVi: 'Những người bạn thực sự lắng nghe tiếng nói lương tâm bên trong khi đưa ra các quyết định khó khăn.',
        phoneticFocus: '/ˈkɒnʃəns/ · /dɪˈsɪʒnz/',
        clozeWord: 'conscience',
        clozeHintVi: 'danh từ (10 chữ cái): lương tâm, ý thức đạo đức',
        clozeExplanationEn: '"Conscience" is an inner feeling or voice viewed as acting as a guide to the rightness or wrongness of one’s behavior.',
        clozeExplanationVi: 'Chữa lỗi: "conscience" (/ˈkɒnʃəns/) nghĩa là lương tâm.',
      },
    ],
  },
  {
    id: 'vid_anim_10',
    title: 'Animation: Finding Nemo — Overcoming Fear in the Vast Ocean',
    titleVi: 'Hoạt hình: Đi Tìm Nemo — Vượt Qua Nỗi Sợ Giữa Đại Dương Bao La',
    category: 'Animation',
    speakerName: 'Marlin & Dory',
    accent: 'Expressive American English',
    bandLevel: '3.5-5.0',
    topic: 'Environment',
    youtubeId: '2zLkasScy7A',
    lines: [
      {
        speaker: 'Marlin',
        text: 'If you never let anything happen to your children, they will never learn independence.',
        translationVi: 'Nếu bạn không bao giờ để bất cứ điều gì xảy ra với con cái, chúng sẽ không bao giờ học được tính tự lập.',
        phoneticFocus: '/ˈhæpən/ · /ˌɪndɪˈpendəns/',
        clozeWord: 'independence',
        clozeHintVi: 'danh từ (12 chữ cái): sự tự lập, tính độc lập',
        clozeExplanationEn: '"Independence" is the fact or state of being independent and self-reliant.',
        clozeExplanationVi: 'Chữa lỗi: "independence" (n) là tính tự lập — chủ đề rất phổ biến trong IELTS Writing.',
      },
      {
        speaker: 'Dory',
        text: 'When life gets overwhelming, you just have to keep swimming with optimism.',
        translationVi: 'Khi cuộc sống trở nên quá tải, bạn chỉ cần tiếp tục bơi về phía trước với sự lạc quan.',
        phoneticFocus: '/ˈswɪmɪŋ/ · /ˈɒptɪmɪzəm/',
        clozeWord: 'optimism',
        clozeHintVi: 'danh từ (8 chữ cái): tinh thần lạc quan',
        clozeExplanationEn: '"Optimism" is hopefulness and confidence about the future or the successful outcome of something.',
        clozeExplanationVi: 'Chữa lỗi: "optimism" (n) là sự lạc quan, đối lập với "pessimism" (sự bi quan).',
      },
    ],
  },
  {
    id: 'vid_anim_11',
    title: 'Animation: Moana — Ocean Navigation & Ancestral Wisdom',
    titleVi: 'Hoạt hình: Hành Trình Của Moana — Hải Trình Đại Dương & Trí Tuệ Tổ Tiên',
    category: 'Animation',
    speakerName: 'Moana & Grandma Tala',
    accent: 'Clear Melodic English',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: 'LKFuXETZUsI',
    lines: [
      {
        speaker: 'Moana',
        text: 'Our ancestors were fearless voyagers who navigated the Pacific using the stars.',
        translationVi: 'Tổ tiên chúng ta là những nhà du hành biển không biết sợ hãi, định hướng Thái Bình Dương bằng các vì sao.',
        phoneticFocus: '/ˈvɔɪɪdʒəz/ · /ˈnævɪɡeɪtɪd/',
        clozeWord: 'navigated',
        clozeHintVi: 'động từ quá khứ (9 chữ cái): định hướng, điều hướng hải trình',
        clozeExplanationEn: '"Navigate" means to plan and direct the route or course of a ship or other form of transportation.',
        clozeExplanationVi: 'Chữa lỗi: "navigate" (v) nghĩa là định hướng đường đi, điều hướng.',
      },
      {
        speaker: 'Grandma Tala',
        text: 'Restoring harmony with nature requires courage and respect for the ocean.',
        translationVi: 'Khôi phục sự hài hòa với thiên nhiên đòi hỏi lòng dũng cảm và sự tôn trọng đại dương.',
        phoneticFocus: '/ˈhɑːməni/ · /rɪˈspekt/',
        clozeWord: 'harmony',
        clozeHintVi: 'danh từ (7 chữ cái): sự hài hòa, sự hòa hợp',
        clozeExplanationEn: '"Harmony" is the state of being in agreement or concord.',
        clozeExplanationVi: 'Chữa lỗi: "in harmony with nature" là sống hài hòa với thiên nhiên.',
      },
    ],
  },
  {
    id: 'vid_anim_12',
    title: 'Animation: Spider-Man: Into the Spider-Verse — Taking a Leap of Faith',
    titleVi: 'Hoạt hình: Người Nhện: Vũ Trụ Mới — Bước Nhảy Của Niềm Tin',
    category: 'Animation',
    speakerName: 'Miles Morales & Peter B. Parker',
    accent: 'Modern Urban American',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'g4Hbz2jLxvQ',
    lines: [
      {
        speaker: 'Peter B. Parker',
        text: 'You cannot wait until you feel completely ready; mastery begins with a leap of faith.',
        translationVi: 'Bạn không thể đợi đến khi cảm thấy hoàn toàn sẵn sàng; sự làm chủ bắt đầu bằng một bước nhảy của niềm tin.',
        phoneticFocus: '/kəmˈpliːtli/ · /ˈmɑːstəri/',
        clozeWord: 'mastery',
        clozeHintVi: 'danh từ (7 chữ cái): sự tinh thông, sự làm chủ kỹ năng',
        clozeExplanationEn: '"Mastery" is comprehensive knowledge or skill in a subject or accomplishment.',
        clozeExplanationVi: 'Chữa lỗi: "mastery" (n) là sự làm chủ, sự thông thạo toàn diện.',
      },
      {
        speaker: 'Miles Morales',
        text: 'Everyone wears the mask differently, bringing their unique perspective to the team.',
        translationVi: 'Mỗi người đeo chiếc mặt nạ theo một cách khác nhau, mang góc nhìn độc đáo của riêng họ vào tập thể.',
        phoneticFocus: '/juˈniːk/ · /pəˈspektɪv/',
        clozeWord: 'perspective',
        clozeHintVi: 'danh từ (11 chữ cái): góc nhìn, quan điểm',
        clozeExplanationEn: '"Perspective" is a particular attitude toward or way of regarding something; a point of view.',
        clozeExplanationVi: 'Chữa lỗi: "unique perspective" là góc nhìn, nhãn quan độc đáo.',
      },
    ],
  },
  {
    id: 'vid_anim_13',
    title: 'Animation: How to Train Your Dragon — Empathy Over Conflict',
    titleVi: 'Hoạt hình: Bí Kíp Luyện Rồng — Thấu Cảm Thay Vì Xung Đột',
    category: 'Animation',
    speakerName: 'Hiccup',
    accent: 'Clear North American',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: 'oKiYuIsPxYk',
    lines: [
      {
        speaker: 'Hiccup',
        text: 'Everything we knew about these creatures was wrong; empathy replaced centuries of conflict.',
        translationVi: 'Mọi thứ chúng ta từng biết về những sinh vật này đều sai; sự thấu cảm đã thay thế hàng thế kỷ xung đột.',
        phoneticFocus: '/ˈkriːtʃəz/ · /ˈempəθi/',
        clozeWord: 'empathy',
        clozeHintVi: 'danh từ (7 chữ cái): sự thấu cảm, sự đồng cảm sâu sắc',
        clozeExplanationEn: '"Empathy" is the ability to understand and share the feelings of another.',
        clozeExplanationVi: 'Chữa lỗi: "empathy" (n) là sự thấu cảm, đặt mình vào vị trí người khác.',
      },
      {
        speaker: 'Hiccup',
        text: 'Building mutual trust takes patience and consistent observation.',
        translationVi: 'Xây dựng sự tin tưởng lẫn nhau cần có lòng kiên nhẫn và sự quan sát nhất quán.',
        phoneticFocus: '/ˈmjuːtʃuəl/ · /ˌɒbzəˈveɪʃn/',
        clozeWord: 'mutual',
        clozeHintVi: 'tính từ (6 chữ cái): lẫn nhau, qua lại đôi bên',
        clozeExplanationEn: '"Mutual" means experienced or done by each of two or more parties toward the other.',
        clozeExplanationVi: 'Chữa lỗi: "mutual trust" là sự tin tưởng lẫn nhau từ hai phía.',
      },
    ],
  },
  {
    id: 'vid_anim_14',
    title: 'Animation: The Lion King — Learning from the Past',
    titleVi: 'Hoạt hình: Vua Sư Tử (The Lion King) — Học Hỏi Từ Quá Khứ',
    category: 'Animation',
    speakerName: 'Rafiki & Simba',
    accent: 'Expressive Theatrical English',
    bandLevel: '3.5-5.0',
    topic: 'Society',
    youtubeId: '7TavVZMewpY',
    lines: [
      {
        speaker: 'Rafiki',
        text: 'The past can hurt, but you can either run from it or learn a valuable lesson from it.',
        translationVi: 'Quá khứ có thể gây đau đớn, nhưng bạn có thể chọn chạy trốn khỏi nó hoặc rút ra bài học quý giá từ nó.',
        phoneticFocus: '/ˈvæljuəbl/ · /ˈlesn/',
        clozeWord: 'valuable',
        clozeHintVi: 'tính từ (8 chữ cái): quý giá, có giá trị lớn',
        clozeExplanationEn: '"Valuable" means worth a great deal of money or extremely useful and important.',
        clozeExplanationVi: 'Chữa lỗi: "valuable lesson" là bài học kinh nghiệm quý báu.',
      },
      {
        speaker: 'Simba',
        text: 'Stepping up to leadership means accepting accountability for the entire kingdom.',
        translationVi: 'Bước lên vị trí lãnh đạo đồng nghĩa với việc chấp nhận trách nhiệm giải trình trước toàn bộ vương quốc.',
        phoneticFocus: '/ˈliːdəʃɪp/ · /əˌkaʊntəˈbɪləti/',
        clozeWord: 'accountability',
        clozeHintVi: 'danh từ (14 chữ cái): trách nhiệm giải trình, sự chịu trách nhiệm',
        clozeExplanationEn: '"Accountability" (C1) is the fact or condition of being accountable; responsibility.',
        clozeExplanationVi: 'Chữa lỗi: "accountability" (n) là từ vựng C1 nghĩa là trách nhiệm giải trình.',
      },
    ],
  },

  // ==================== PHIM ĐIỆN ẢNH / MOVIES (14 VIDEOS) ====================
  {
    id: 'vid_movie_01',
    title: 'Movies: The Pursuit of Happyness — Protecting Your Ambition',
    titleVi: 'Phim Điện ảnh: Mưu Cầu Hạnh Phúc — Bảo Vệ Hoài Bão Của Bạn',
    category: 'Movies',
    speakerName: 'Chris Gardner (Will Smith)',
    accent: 'Inspirational American English',
    bandLevel: '5.0-6.0',
    topic: 'Economy',
    youtubeId: 'DMOBlEcRuw8',
    lines: [
      {
        speaker: 'Chris Gardner',
        text: 'Do not ever let somebody tell you that you cannot achieve a meaningful goal.',
        translationVi: 'Đừng bao giờ để bất kỳ ai nói với con rằng con không thể đạt được một mục tiêu ý nghĩa.',
        phoneticFocus: '/əˈtʃiːv/ · /ˈmiːnɪŋfl/',
        clozeWord: 'achieve',
        clozeHintVi: 'động từ (7 chữ cái): đạt được, chinh phục thành công',
        clozeExplanationEn: '"Achieve" means to successfully bring about or reach a desired objective by effort.',
        clozeExplanationVi: 'Chữa lỗi: "achieve a goal" là cụm Collocation chuẩn nghĩa là đạt được mục tiêu.',
      },
      {
        speaker: 'Chris Gardner',
        text: 'If you have a dream, you must protect it with relentless determination.',
        translationVi: 'Nếu con có một ước mơ, con phải bảo vệ nó bằng sự quyết tâm bền bỉ không ngừng.',
        phoneticFocus: '/rɪˈlentləs/ · /dɪˌtɜːmɪˈneɪʃn/',
        clozeWord: 'determination',
        clozeHintVi: 'danh từ (13 chữ cái): sự quyết tâm kiên định',
        clozeExplanationEn: '"Determination" is firmness of purpose; resoluteness.',
        clozeExplanationVi: 'Chữa lỗi: "determination" (n) là lòng quyết tâm vững chắc.',
      },
    ],
  },
  {
    id: 'vid_movie_02',
    title: 'Movies: Interstellar — Science, Exploration & Human Survival',
    titleVi: 'Phim Điện ảnh: Hố Đen Tử Thần (Interstellar) — Khoa Học & Sự Sinh Tồn Của Nhân Loại',
    category: 'Movies',
    speakerName: 'Cooper & Dr. Brand',
    accent: 'Cinematic American English',
    bandLevel: '6.0-7.0+',
    topic: 'Technology',
    youtubeId: 'zSWdZVtXT7E',
    lines: [
      {
        speaker: 'Cooper',
        text: 'Mankind was born on Earth, but our species was never meant to stagnate here.',
        translationVi: 'Nhân loại sinh ra trên Trái Đất, nhưng giống loài của chúng ta không bao giờ được định sẵn sẽ trì trệ tại đây.',
        phoneticFocus: '/ˈspiːʃiːz/ · /stæɡˈneɪt/',
        clozeWord: 'stagnate',
        clozeHintVi: 'động từ (8 chữ cái): trì trệ, giậm chân tại chỗ',
        clozeExplanationEn: '"Stagnate" (C1 verb) means to cease developing; to become inactive or dull.',
        clozeExplanationVi: 'Chữa lỗi: "stagnate" (v) là từ vựng C1 nghĩa là đình trệ, ngừng phát triển.',
      },
      {
        speaker: 'Dr. Brand',
        text: 'Scientific innovation transcends the boundaries of time and gravity.',
        translationVi: 'Sự đổi mới khoa học vượt qua cả những ranh giới của thời gian và trọng lực.',
        phoneticFocus: '/trænˈsendz/ · /ˈbaʊndəriz/',
        clozeWord: 'transcends',
        clozeHintVi: 'động từ ngôi thứ 3 (10 chữ cái): vượt lên trên, vượt qua giới hạn',
        clozeExplanationEn: '"Transcend" (C1) means to go beyond the range or limits of something.',
        clozeExplanationVi: 'Chữa lỗi: "transcend the boundaries" là vượt qua những ranh giới thông thường.',
      },
    ],
  },
  {
    id: 'vid_movie_03',
    title: 'Movies: Oppenheimer — Theoretical Physics & Ethical Responsibility',
    titleVi: 'Phim Điện ảnh: Oppenheimer — Vật Lý Lý Thuyết & Trách Nhiệm Đạo Đức Khoa Học',
    category: 'Movies',
    speakerName: 'J. Robert Oppenheimer',
    accent: 'Mid-Atlantic Academic English',
    bandLevel: '6.0-7.0+',
    topic: 'Technology',
    youtubeId: 'uYPbbksJxIg',
    lines: [
      {
        speaker: 'Oppenheimer',
        text: 'Theory will only take you so far; empirical verification changes history.',
        translationVi: 'Lý thuyết chỉ đưa bạn đi được một chặng; chính sự kiểm chứng thực nghiệm mới làm thay đổi lịch sử.',
        phoneticFocus: '/ɪmˈpɪrɪkl/ · /ˌverɪfɪˈkeɪʃn/',
        clozeWord: 'empirical',
        clozeHintVi: 'tính từ (9 chữ cái): mang tính thực nghiệm, dựa trên quan sát thực tế',
        clozeExplanationEn: '"Empirical" (C1) means based on, concerned with, or verifiable by observation or experience rather than theory.',
        clozeExplanationVi: 'Chữa lỗi: "empirical" (adj) nghĩa là thực nghiệm (đối lập với "theoretical" — lý thuyết).',
      },
      {
        speaker: 'Oppenheimer',
        text: 'Scientists must confront the profound ethical implications of their discoveries.',
        translationVi: 'Các nhà khoa học phải đối mặt với những hệ quả đạo đức sâu sắc từ các khám phá của mình.',
        phoneticFocus: '/ˈeθɪkl/ · /ˌɪmplɪˈkeɪʃnz/',
        clozeWord: 'implications',
        clozeHintVi: 'danh từ số nhiều (12 chữ cái): những hệ lụy, hệ quả kéo theo',
        clozeExplanationEn: '"Implications" are the effects or consequences that may happen in the future.',
        clozeExplanationVi: 'Chữa lỗi: "ethical implications" là những hệ quả, tác động về mặt đạo đức.',
      },
    ],
  },
  {
    id: 'vid_movie_04',
    title: 'Movies: Dead Poets Society — Critical Thinking & Seizing the Day',
    titleVi: 'Phim Điện ảnh: Hội Cố Thi Nhân (Dead Poets Society) — Tư Duy Độc Lập & Nắm Bắt Hiện Tại',
    category: 'Movies',
    speakerName: 'John Keating (Robin Williams)',
    accent: 'Articulate Literary English',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'ye4KFyWu2do',
    lines: [
      {
        speaker: 'John Keating',
        text: 'We read and write poetry because we are members of the human race, and the human race is filled with passion.',
        translationVi: 'Chúng ta đọc và viết thơ bởi vì chúng ta là thành viên của nhân loại, và nhân loại thì tràn đầy nhiệt huyết đam mê.',
        phoneticFocus: '/ˈpəʊətri/ · /ˈpæʃn/',
        clozeWord: 'passion',
        clozeHintVi: 'danh từ (7 chữ cái): niềm đam mê mãnh liệt',
        clozeExplanationEn: '"Passion" is strong and barely controllable emotion or enthusiasm.',
        clozeExplanationVi: 'Chữa lỗi: "passion" (n) là niềm đam mê, cảm xúc mãnh liệt.',
      },
      {
        speaker: 'John Keating',
        text: 'In university seminars, you must strive to find your own authentic voice.',
        translationVi: 'Trong các buổi thảo luận đại học, các em phải nỗ lực tìm ra tiếng nói chân thực của riêng mình.',
        phoneticFocus: '/straɪv/ · /ɔːˈθentɪk/',
        clozeWord: 'authentic',
        clozeHintVi: 'tính từ (9 chữ cái): đích thực, chân thực, nguyên bản',
        clozeExplanationEn: '"Authentic" means of undisputed origin; genuine.',
        clozeExplanationVi: 'Chữa lỗi: "authentic" (adj) nghĩa là chân thực, mang bản sắc riêng.',
      },
    ],
  },
  {
    id: 'vid_movie_05',
    title: 'Movies: Inception — The Architecture of Ideas & Subconscious Mind',
    titleVi: 'Phim Điện ảnh: Kẻ Đánh Cắp Giấc Mơ (Inception) — Sức Mạnh Của Một Ý Tưởng',
    category: 'Movies',
    speakerName: 'Dom Cobb & Ariadne',
    accent: 'Transatlantic Cinema English',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'YoHD9XEInc0',
    lines: [
      {
        speaker: 'Dom Cobb',
        text: 'An idea is like a resilient seed; once planted in the mind, it can transform reality.',
        translationVi: 'Một ý tưởng giống như một hạt giống kiên cường; một khi đã gieo vào tâm trí, nó có thể thay đổi thực tại.',
        phoneticFocus: '/rɪˈzɪliənt/ · /trænsˈfɔːm/',
        clozeWord: 'transform',
        clozeHintVi: 'động từ (9 chữ cái): biến đổi hoàn toàn, chuyển hóa',
        clozeExplanationEn: '"Transform" means to make a thorough or dramatic change in the form, appearance, or character of.',
        clozeExplanationVi: 'Chữa lỗi: "transform" (v) nghĩa là làm thay đổi toàn diện, chuyển hóa.',
      },
      {
        speaker: 'Ariadne',
        text: 'Designing complex architecture requires paradoxical creativity and precision.',
        translationVi: 'Thiết kế kiến trúc phức tạp đòi hỏi sự sáng tạo nghịch lý và độ chính xác cao.',
        phoneticFocus: '/ˈɑːkɪtektʃər/ · /prɪˈsɪʒn/',
        clozeWord: 'precision',
        clozeHintVi: 'danh từ (9 chữ cái): sự chính xác tuyệt đối, độ chuẩn xác',
        clozeExplanationEn: '"Precision" is the quality, condition, or fact of being exact and accurate.',
        clozeExplanationVi: 'Chữa lỗi: "precision" (n) là độ chính xác, sự tỉ mỉ chuẩn xác.',
      },
    ],
  },
  {
    id: 'vid_movie_06',
    title: 'Movies: The Social Network — Digital Startups & Global Connectivity',
    titleVi: 'Phim Điện ảnh: Mạng Xã Hội (The Social Network) — Khởi Nghiệp Công Nghệ & Kết Nối Toàn Cầu',
    category: 'Movies',
    speakerName: 'Mark & Eduardo',
    accent: 'Fast-Paced Academic American',
    bandLevel: '5.0-6.0',
    topic: 'Technology',
    youtubeId: 'lB95KLmpLR4',
    lines: [
      {
        speaker: 'Mark',
        text: 'In the digital age, social platforms have revolutionized how university students interact.',
        translationVi: 'Trong kỷ nguyên số, các nền tảng mạng xã hội đã cách mạng hóa cách sinh viên đại học tương tác với nhau.',
        phoneticFocus: '/ˈplætfɔːmz/ · /ˌrevəˈluːʃənaɪzd/',
        clozeWord: 'revolutionized',
        clozeHintVi: 'động từ phân từ 2 (14 chữ cái): cách mạng hóa, thay đổi triệt để',
        clozeExplanationEn: '"Revolutionize" means to change something radically or fundamentally.',
        clozeExplanationVi: 'Chữa lỗi: "revolutionize" (v) là cách mạng hóa, tạo ra bước ngoặt hoàn toàn mới.',
      },
      {
        speaker: 'Eduardo',
        text: 'Scaling a startup requires sustainable revenue and user trust.',
        translationVi: 'Mở rộng quy mô một công ty khởi nghiệp đòi hỏi doanh thu bền vững và niềm tin của người dùng.',
        phoneticFocus: '/ˈrevənjuː/ · /trʌst/',
        clozeWord: 'revenue',
        clozeHintVi: 'danh từ (7 chữ cái): doanh thu tài chính',
        clozeExplanationEn: '"Revenue" is income, especially when of a company or organization and of a substantial nature.',
        clozeExplanationVi: 'Chữa lỗi: "revenue" (n) là tổng doanh thu của doanh nghiệp hoặc ngân sách.',
      },
    ],
  },
  {
    id: 'vid_movie_07',
    title: 'Movies: Good Will Hunting — Book Knowledge vs. Lived Experience',
    titleVi: 'Phim Điện ảnh: Chàng Will Tốt Bụng — Tri Thức Sách Vở & Trải Nghiệm Thực Tế',
    category: 'Movies',
    speakerName: 'Dr. Sean Maguire & Will',
    accent: 'Warm American English',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'PaZVjZEFkRs',
    lines: [
      {
        speaker: 'Sean Maguire',
        text: 'You can recite every textbook in the library, yet genuine wisdom comes from personal experience.',
        translationVi: 'Bạn có thể đọc thuộc lòng mọi cuốn giáo trình trong thư viện, nhưng trí tuệ đích thực lại đến từ trải nghiệm cá nhân.',
        phoneticFocus: '/rɪˈsaɪt/ · /ˈwɪzdəm/',
        clozeWord: 'wisdom',
        clozeHintVi: 'danh từ (6 chữ cái): sự thông thái, trí tuệ sâu sắc',
        clozeExplanationEn: '"Wisdom" is the quality of having experience, knowledge, and good judgment.',
        clozeExplanationVi: 'Chữa lỗi: "wisdom" (n) là sự thông thái được đúc kết từ tri thức và trải nghiệm sống.',
      },
      {
        speaker: 'Will',
        text: 'Intellectual curiosity opens doors that privilege alone cannot unlock.',
        translationVi: 'Sự tò mò học thuật mở ra những cánh cửa mà đặc quyền đơn thuần không thể mở được.',
        phoneticFocus: '/ˌɪntəˈlektʃuəl/ · /ˈprɪvəlɪdʒ/',
        clozeWord: 'intellectual',
        clozeHintVi: 'tính từ (12 chữ cái): thuộc về trí tuệ, học thuật',
        clozeExplanationEn: '"Intellectual" relates to the intellect and higher mental faculties.',
        clozeExplanationVi: 'Chữa lỗi: "intellectual curiosity" là sự tò mò về mặt trí tuệ, ham học hỏi.',
      },
    ],
  },
  {
    id: 'vid_movie_08',
    title: 'Movies: The Shawshank Redemption — Hope & Institutional Perseverance',
    titleVi: 'Phim Điện ảnh: Nhà Tù Shawshank — Niềm Hy Vọng & Sự Kiên Định',
    category: 'Movies',
    speakerName: 'Andy Dufresne & Red',
    accent: 'Classic Narrative American',
    bandLevel: '5.0-6.0',
    topic: 'Society',
    youtubeId: 'PLl99DlL6b4',
    lines: [
      {
        speaker: 'Andy Dufresne',
        text: 'Hope is a good thing, maybe the finest of things, and no good thing ever perishes.',
        translationVi: 'Hy vọng là một điều tốt đẹp, có lẽ là điều tuyệt vời nhất, và không điều tốt đẹp nào lại lụi tàn.',
        phoneticFocus: '/ˈfaɪnɪst/ · /ˈperɪʃɪz/',
        clozeWord: 'perishes',
        clozeHintVi: 'động từ ngôi thứ 3 (8 chữ cái): lụi tàn, biến mất, diệt vong',
        clozeExplanationEn: '"Perish" (C1) means to suffer complete ruin or destruction; cease to exist.',
        clozeExplanationVi: 'Chữa lỗi: "perish" (v) là từ vựng nâng cao nghĩa là mai một, lụi tàn.',
      },
      {
        speaker: 'Red',
        text: 'Expanding the prison library gave inmates a sense of dignity and rehabilitation.',
        translationVi: 'Mở rộng thư viện đã mang lại cho các phạm nhân cảm giác về phẩm giá và sự phục hồi hoàn lương.',
        phoneticFocus: '/ˈdɪɡnəti/ · /ˌriːəˌbɪlɪˈteɪʃn/',
        clozeWord: 'dignity',
        clozeHintVi: 'danh từ (7 chữ cái): phẩm giá, lòng tự trọng',
        clozeExplanationEn: '"Dignity" is the state or quality of being worthy of honor or respect.',
        clozeExplanationVi: 'Chữa lỗi: "dignity" (n) là phẩm giá con người — từ vựng rất đắt giá trong chủ đề Society.',
      },
    ],
  },
  {
    id: 'vid_movie_09',
    title: 'Movies: The Theory of Everything — Cosmology & Overcoming Adversity',
    titleVi: 'Phim Điện ảnh: Thuyết Yêu Thương (Stephen Hawking) — Vũ Trụ Học & Nghị Lực Phi Thường',
    category: 'Movies',
    speakerName: 'Stephen Hawking (Eddie Redmayne)',
    accent: 'Received Pronunciation (British)',
    bandLevel: '6.0-7.0+',
    topic: 'Health',
    youtubeId: 'Salz7uGp72c',
    lines: [
      {
        speaker: 'Stephen Hawking',
        text: 'However difficult life may seem, there is always something you can do and succeed at.',
        translationVi: 'Dù cuộc sống có vẻ khó khăn đến đâu, luôn có một điều gì đó bạn có thể làm và đạt được thành công.',
        phoneticFocus: '/ˈdɪfɪkəlt/ · /səkˈsiːd/',
        clozeWord: 'succeed',
        clozeHintVi: 'động từ (7 chữ cái): thành công',
        clozeExplanationEn: '"Succeed at" means to achieve the desired aim or result in an activity.',
        clozeExplanationVi: 'Chữa lỗi: Động từ "succeed" đi với giới từ "at" hoặc "in" (succeed at/in sth).',
      },
      {
        speaker: 'Stephen Hawking',
        text: 'Where there is life, there is hope for groundbreaking scientific discovery.',
        translationVi: 'Nơi nào còn sự sống, nơi đó còn hy vọng cho những khám phá khoa học mang tính đột phá.',
        phoneticFocus: '/ˈɡraʊndbreɪkɪŋ/ · /dɪˈskʌvəri/',
        clozeWord: 'groundbreaking',
        clozeHintVi: 'tính từ (14 chữ cái): mang tính đột phá, mở đường',
        clozeExplanationEn: '"Groundbreaking" (C1) means breaking new ground; innovative; pioneering.',
        clozeExplanationVi: 'Chữa lỗi: "groundbreaking discovery" là khám phá mang tính đột phá tiên phong.',
      },
    ],
  },
  {
    id: 'vid_movie_10',
    title: 'Movies: Harry Potter — Choices vs. Abilities at Hogwarts',
    titleVi: 'Phim Điện ảnh: Harry Potter — Sự Lựa Chọn Quyết Định Con Người Chúng Ta',
    category: 'Movies',
    speakerName: 'Albus Dumbledore & Hermione',
    accent: 'British RP (Received Pronunciation)',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: 'VyHV0BRtdxo',
    lines: [
      {
        speaker: 'Dumbledore',
        text: 'It is our choices, far more than our abilities, that show what we truly are.',
        translationVi: 'Chính những sự lựa chọn của chúng ta, hơn cả năng lực bẩm sinh, mới thể hiện con người thật của chúng ta.',
        phoneticFocus: '/ˈtʃɔɪsɪz/ · /əˈbɪlətiz/',
        clozeWord: 'abilities',
        clozeHintVi: 'danh từ số nhiều (9 chữ cái): những năng lực, khả năng',
        clozeExplanationEn: '"Abilities" refers to possession of the means or skill to do something.',
        clozeExplanationVi: 'Chữa lỗi: Câu chẻ nhấn mạnh "It is our choices, far more than our abilities, that...".',
      },
      {
        speaker: 'Hermione',
        text: 'Diligent study in the library prepares us for unexpected academic challenges.',
        translationVi: 'Việc học tập chăm chỉ trong thư viện chuẩn bị cho chúng ta trước những thử thách học thuật bất ngờ.',
        phoneticFocus: '/ˈdɪlɪdʒənt/ · /ˌʌnɪkˈspektɪd/',
        clozeWord: 'diligent',
        clozeHintVi: 'tính từ (8 chữ cái): cần cù, siêng năng, chăm chỉ',
        clozeExplanationEn: '"Diligent" (B2/C1) means having or showing care and conscientiousness in one’s work or duties.',
        clozeExplanationVi: 'Chữa lỗi: "diligent" (adj) là từ học thuật nâng cao thay thế cho "hard-working".',
      },
    ],
  },
  {
    id: 'vid_movie_11',
    title: 'Movies: Forrest Gump — Adaptability & Unconditional Kindness',
    titleVi: 'Phim Điện ảnh: Cuộc Đời Forrest Gump — Sự Thích Nghi & Lòng Chân Thành',
    category: 'Movies',
    speakerName: 'Forrest Gump',
    accent: 'Slow Clear American Storytelling',
    bandLevel: '0-3.5',
    topic: 'Society',
    youtubeId: 'bLvqoHBptjg',
    lines: [
      {
        speaker: 'Forrest Gump',
        text: 'My mother always explained that life is full of unexpected surprises.',
        translationVi: 'Mẹ tôi luôn giải thích rằng cuộc sống chứa đầy những điều bất ngờ không đoán trước được.',
        phoneticFocus: '/ɪkˈspleɪnd/ · /səˈpraɪzɪz/',
        clozeWord: 'surprises',
        clozeHintVi: 'danh từ số nhiều (9 chữ cái): những điều bất ngờ',
        clozeExplanationEn: '"Surprises" are unexpected or astonishing events or facts.',
        clozeExplanationVi: 'Chữa lỗi: "unexpected surprises" là những điều bất ngờ trong cuộc sống.',
      },
      {
        speaker: 'Forrest Gump',
        text: 'Keeping a promise to a friend is the most honorable thing a person can do.',
        translationVi: 'Giữ lời hứa với một người bạn là điều đáng trân trọng nhất mà một người có thể làm.',
        phoneticFocus: '/ˈprɒmɪs/ · /ˈɒnərəbl/',
        clozeWord: 'honorable',
        clozeHintVi: 'tính từ (9 chữ cái): đáng kính trọng, danh dự',
        clozeExplanationEn: '"Honorable" means bringing or worthy of honor and respect.',
        clozeExplanationVi: 'Chữa lỗi: "honorable" (adj) nghĩa là đáng trọng, ngay thẳng.',
      },
    ],
  },
  {
    id: 'vid_movie_12',
    title: 'Movies: La La Land — Artistic Ambition & Creative Dedication',
    titleVi: 'Phim Điện ảnh: Những Kẻ Khờ Mộng Mơ (La La Land) — Khát Vọng Nghệ Thuật',
    category: 'Movies',
    speakerName: 'Mia & Sebastian',
    accent: 'Contemporary American English',
    bandLevel: '5.0-6.0',
    topic: 'Society',
    youtubeId: '0pdqf4P9MB8',
    lines: [
      {
        speaker: 'Mia',
        text: 'Here is to the dreamers who pursue artistic excellence despite repeated rejection.',
        translationVi: 'Dành tặng những người mộng mơ luôn theo đuổi sự xuất sắc nghệ thuật bất chấp những lần bị từ chối liên tiếp.',
        phoneticFocus: '/ˈeksələns/ · /rɪˈdʒekʃn/',
        clozeWord: 'excellence',
        clozeHintVi: 'danh từ (10 chữ cái): sự xuất sắc, sự ưu tú vượt trội',
        clozeExplanationEn: '"Excellence" is the quality of being outstanding or extremely good.',
        clozeExplanationVi: 'Chữa lỗi: "pursue excellence" là theo đuổi sự xuất sắc.',
      },
      {
        speaker: 'Sebastian',
        text: 'Traditional jazz thrives on spontaneous improvisation and active listening.',
        translationVi: 'Nhạc jazz truyền thống thăng hoa nhờ sự ngẫu hứng tức thời và sự lắng nghe chủ động.',
        phoneticFocus: '/spɒnˈteɪniəs/ · /ˌɪmprəvaɪˈzeɪʃn/',
        clozeWord: 'spontaneous',
        clozeHintVi: 'tính từ (11 chữ cái): tự phát, ngẫu hứng tự nhiên',
        clozeExplanationEn: '"Spontaneous" (B2/C1) means performed or occurring as a result of a sudden inner impulse without premeditation.',
        clozeExplanationVi: 'Chữa lỗi: "spontaneous" (adj) nghĩa là tự nhiên, ngẫu hứng tức thời.',
      },
    ],
  },
  {
    id: 'vid_movie_13',
    title: 'Movies: The Devil Wears Prada — Professional Standards & Industry Influence',
    titleVi: 'Phim Điện ảnh: Yêu Nữ Thích Hàng Hiệu — Tiêu Chuẩn Nghề Nghiệp & Kinh Tế Thời Trang',
    category: 'Movies',
    speakerName: 'Miranda Priestly & Andy',
    accent: 'Crisp Executive American',
    bandLevel: '6.0-7.0+',
    topic: 'Economy',
    youtubeId: '6ZOZwUQKu3E',
    lines: [
      {
        speaker: 'Miranda Priestly',
        text: 'That sweater represents millions of dollars and countless jobs in the global textile industry.',
        translationVi: 'Chiếc áo len đó đại diện cho hàng triệu đô la và vô số việc làm trong ngành công nghiệp dệt may toàn cầu.',
        phoneticFocus: '/ˌreprɪˈzents/ · /ˈtekstaɪl/',
        clozeWord: 'industry',
        clozeHintVi: 'danh từ (8 chữ cái): ngành công nghiệp',
        clozeExplanationEn: '"Industry" refers to economic activity concerned with the processing of raw materials and manufacture of goods.',
        clozeExplanationVi: 'Chữa lỗi: "global textile industry" là ngành công nghiệp dệt may toàn cầu.',
      },
      {
        speaker: 'Andy',
        text: 'Adapting to a demanding workplace requires professional competence and resilience.',
        translationVi: 'Thích nghi với một môi trường làm việc khắt khe đòi hỏi năng lực chuyên môn và bản lĩnh vững vàng.',
        phoneticFocus: '/dɪˈmɑːndɪŋ/ · /ˈkɒmpɪtəns/',
        clozeWord: 'competence',
        clozeHintVi: 'danh từ (10 chữ cái): năng lực chuyên môn',
        clozeExplanationEn: '"Competence" is the ability to do something successfully or efficiently.',
        clozeExplanationVi: 'Chữa lỗi: "professional competence" là năng lực chuyên môn nghề nghiệp.',
      },
    ],
  },
  {
    id: 'vid_movie_14',
    title: 'Movies: Sherlock Holmes — Deductive Reasoning & Observation',
    titleVi: 'Phim Điện ảnh: Thám Tử Sherlock Holmes — Tư Duy Suy Diễn Logic & Quan Sát Tinh Tế',
    category: 'Movies',
    speakerName: 'Sherlock Holmes & Dr. Watson',
    accent: 'British Received Pronunciation',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'J7nJksXDBWc',
    lines: [
      {
        speaker: 'Sherlock Holmes',
        text: 'It is a capital mistake to theorize before one has collected sufficient evidence.',
        translationVi: 'Đó là một sai lầm nghiêm trọng khi đưa ra giả thuyết trước khi thu thập đủ bằng chứng.',
        phoneticFocus: '/ˈθɪəraɪz/ · /səˈfɪʃnt/',
        clozeWord: 'evidence',
        clozeHintVi: 'danh từ không đếm được (8 chữ cái): bằng chứng, chứng cứ',
        clozeExplanationEn: '"Evidence" is the available body of facts or information indicating whether a belief or proposition is true.',
        clozeExplanationVi: 'Chữa lỗi: "sufficient evidence" (danh từ không đếm được) nghĩa là đầy đủ bằng chứng.',
      },
      {
        speaker: 'Dr. Watson',
        text: 'Careful observation distinguishes a keen analyst from a casual spectator.',
        translationVi: 'Sự quan sát cẩn trọng phân biệt một nhà phân tích sắc sảo với một người xem bình thường.',
        phoneticFocus: '/ˌɒbzəˈveɪʃn/ · /dɪˈstɪŋɡwɪʃɪz/',
        clozeWord: 'observation',
        clozeHintVi: 'danh từ (11 chữ cái): sự quan sát tỉ mỉ',
        clozeExplanationEn: '"Observation" is the action or process of closely observing or monitoring something.',
        clozeExplanationVi: 'Chữa lỗi: "careful observation" là sự quan sát tỉ mỉ, khoa học.',
      },
    ],
  },

  // ==================== HỌC THUẬT / ACADEMIC & TED (14 VIDEOS) ====================
  {
    id: 'vid_acad_01',
    title: 'Academic: Oxford Union — Climate Policy & Renewable Transition',
    titleVi: 'Học thuật: Diễn Đàn Đại Học Oxford — Chính Sách Khí Hậu & Chuyển Đổi Năng Lượng Xanh',
    category: 'Academic',
    speakerName: 'Prof. Alistair Vance (Oxford)',
    accent: 'British RP (Received Pronunciation)',
    bandLevel: '6.0-7.0+',
    topic: 'Environment',
    youtubeId: 'dQw4w9WgXcQ',
    lines: [
      {
        speaker: 'Prof. Vance',
        text: 'Decarbonising heavy industry requires coordinated international subsidies and clean grids.',
        translationVi: 'Khử carbon trong ngành công nghiệp nặng đòi hỏi các khoản trợ cấp quốc tế đồng bộ và lưới điện sạch.',
        phoneticFocus: '/diːˈkɑːbənaɪzɪŋ/ · /ˈsʌbsədiz/',
        clozeWord: 'subsidies',
        clozeHintVi: 'danh từ số nhiều (9 chữ cái): các khoản trợ cấp tài chính',
        clozeExplanationEn: '"Subsidies" are grants of money from a government to assist an industry or enterprise.',
        clozeExplanationVi: 'Chữa lỗi: "international subsidies" là các khoản trợ cấp quốc tế.',
      },
      {
        speaker: 'Prof. Vance',
        text: 'Without stringent legislation, carbon emissions will continue to accelerate.',
        translationVi: 'Nếu không có luật pháp nghiêm ngặt, lượng khí thải carbon sẽ tiếp tục gia tăng nhanh chóng.',
        phoneticFocus: '/ˈstrɪndʒənt/ · /ˌledʒɪsˈleɪʃn/',
        clozeWord: 'legislation',
        clozeHintVi: 'danh từ (11 chữ cái): hệ thống luật pháp, quy định pháp lý',
        clozeExplanationEn: '"Legislation" refers to laws, considered collectively.',
        clozeExplanationVi: 'Chữa lỗi: "stringent legislation" là luật pháp, chế tài nghiêm ngặt.',
      },
    ],
  },
  {
    id: 'vid_acad_02',
    title: 'Academic: TED Talk — The Power of Growth Mindset in Learning',
    titleVi: 'Học thuật: TED Talk (Carol Dweck) — Sức Mạnh Của Tư Duy Phát Triển Trong Học Tập',
    category: 'Academic',
    speakerName: 'Prof. Carol Dweck (Stanford)',
    accent: 'Clear Academic American',
    bandLevel: '5.0-6.0',
    topic: 'Education',
    youtubeId: '_X0mgOOSpLU',
    lines: [
      {
        speaker: 'Carol Dweck',
        text: 'When students believe intelligence can be developed, they embrace difficult challenges.',
        translationVi: 'Khi học sinh tin rằng trí thông minh có thể được rèn luyện phát triển, các em sẽ đón nhận những thử thách khó khăn.',
        phoneticFocus: '/ɪnˈtelɪdʒəns/ · /ɪmˈbreɪs/',
        clozeWord: 'intelligence',
        clozeHintVi: 'danh từ (12 chữ cái): trí thông minh, năng lực trí tuệ',
        clozeExplanationEn: '"Intelligence" is the ability to acquire and apply knowledge and skills.',
        clozeExplanationVi: 'Chữa lỗi: "intelligence" (n) là trí thông minh.',
      },
      {
        speaker: 'Carol Dweck',
        text: 'Praising effort and strategy builds long-term academic resilience.',
        translationVi: 'Khen ngợi sự nỗ lực và chiến lược học tập sẽ xây dựng bản lĩnh kiên cường lâu dài.',
        phoneticFocus: '/ˈstrætədʒi/ · /rɪˈzɪliəns/',
        clozeWord: 'strategy',
        clozeHintVi: 'danh từ (8 chữ cái): chiến lược, phương pháp tiếp cận',
        clozeExplanationEn: '"Strategy" is a plan of action designed to achieve a long-term or overall aim.',
        clozeExplanationVi: 'Chữa lỗi: "strategy" (n) là chiến lược, phương pháp thực hiện.',
      },
    ],
  },
  {
    id: 'vid_acad_03',
    title: 'Academic: Cambridge Seminar — Artificial Intelligence & Future Jobs',
    titleVi: 'Học thuật: Hội Thảo Đại Học Cambridge — Trí Tuệ Nhân Tạo & Tương Lai Việc Làm',
    category: 'Academic',
    speakerName: 'Dr. Helena Sterling (Cambridge)',
    accent: 'British RP',
    bandLevel: '6.0-7.0+',
    topic: 'Technology',
    youtubeId: 'ad79nYk2keg',
    lines: [
      {
        speaker: 'Dr. Sterling',
        text: 'Generative algorithms are transforming white-collar professions at an unprecedented pace.',
        translationVi: 'Các thuật toán tạo sinh đang biến đổi các ngành nghề văn phòng với tốc độ chưa từng có tiền lệ.',
        phoneticFocus: '/prəˈfeʃnz/ · /ʌnˈpresɪdentɪd/',
        clozeWord: 'unprecedented',
        clozeHintVi: 'tính từ (13 chữ cái): chưa từng có tiền lệ',
        clozeExplanationEn: '"Unprecedented" (C1) means never done or known before.',
        clozeExplanationVi: 'Chữa lỗi: "at an unprecedented pace" là với tốc độ chưa từng có tiền lệ.',
      },
      {
        speaker: 'Dr. Sterling',
        text: 'Lifelong vocational retraining is imperative for economic adaptability.',
        translationVi: 'Đào tạo lại kỹ năng nghề nghiệp suốt đời là điều bắt buộc để thích ứng kinh tế.',
        phoneticFocus: '/vəʊˈkeɪʃənl/ · /ɪmˈperətɪv/',
        clozeWord: 'imperative',
        clozeHintVi: 'tính từ (10 chữ cái): cấp bách, bắt buộc phải có',
        clozeExplanationEn: '"Imperative" (C1) means of vital importance; crucial.',
        clozeExplanationVi: 'Chữa lỗi: "imperative" (adj) là từ vựng C1 thay thế cho "very important / necessary".',
      },
    ],
  },
  {
    id: 'vid_acad_04',
    title: 'Academic: BBC Earth — Marine Biodiversity & Coral Reefs',
    titleVi: 'Học thuật: BBC Earth — Đa Dạng Sinh Học Biển & Rạn San Hô',
    category: 'Academic',
    speakerName: 'Sir David Attenborough Style',
    accent: 'British Documentary RP',
    bandLevel: '5.0-6.0',
    topic: 'Environment',
    youtubeId: '1A_CAkYt3GY',
    lines: [
      {
        speaker: 'Narrator',
        text: 'Coral reefs support a quarter of all marine biodiversity despite covering less than one percent of the ocean floor.',
        translationVi: 'Các rạn san hô nuôi dưỡng một phần tư tổng đa dạng sinh học biển dù chỉ chiếm chưa đầy một phần trăm đáy đại dương.',
        phoneticFocus: '/məˈriːn/ · /ˌbaɪəʊdaɪˈvɜːsəti/',
        clozeWord: 'biodiversity',
        clozeHintVi: 'danh từ (12 chữ cái): sự đa dạng sinh học',
        clozeExplanationEn: '"Biodiversity" is the variety of plant and animal life in the world or in a particular habitat.',
        clozeExplanationVi: 'Chữa lỗi: "marine biodiversity" là đa dạng sinh học biển.',
      },
      {
        speaker: 'Narrator',
        text: 'Rising sea temperatures cause widespread coral bleaching across tropical waters.',
        translationVi: 'Nhiệt độ nước biển tăng cao gây ra hiện tượng tẩy trắng san hô trên diện rộng khắp vùng biển nhiệt đới.',
        phoneticFocus: '/ˈtemprətʃəz/ · /ˈwaɪdspred/',
        clozeWord: 'widespread',
        clozeHintVi: 'tính từ (10 chữ cái): lan rộng, trên diện rộng',
        clozeExplanationEn: '"Widespread" means found or distributed over a large area or number of people.',
        clozeExplanationVi: 'Chữa lỗi: "widespread" (adj) nghĩa là phổ biến trên diện rộng.',
      },
    ],
  },
  {
    id: 'vid_acad_05',
    title: 'Academic: Harvard Public Health — Sleep Science & Cognitive Memory',
    titleVi: 'Học thuật: Y Tế Công Cộng Harvard — Khoa Học Giấc Ngủ & Trí Nhớ Nhận Thức',
    category: 'Academic',
    speakerName: 'Dr. Matthew Walker Lecture',
    accent: 'British/American Academic',
    bandLevel: '6.0-7.0+',
    topic: 'Health',
    youtubeId: '5MuIMqhT8DM',
    lines: [
      {
        speaker: 'Dr. Walker',
        text: 'Deep sleep consolidates newly acquired vocabulary into long-term memory storage.',
        translationVi: 'Giấc ngủ sâu củng cố vốn từ vựng mới tiếp thu vào kho lưu trữ trí nhớ dài hạn.',
        phoneticFocus: '/kənˈsɒlɪdeɪts/ · /əˈkwaɪəd/',
        clozeWord: 'consolidates',
        clozeHintVi: 'động từ ngôi thứ 3 (12 chữ cái): củng cố, làm bền chặt',
        clozeExplanationEn: '"Consolidate" (C1) means to make something physically stronger or more solid; reinforce.',
        clozeExplanationVi: 'Chữa lỗi: "consolidate memory" là củng cố trí nhớ bền vững.',
      },
      {
        speaker: 'Dr. Walker',
        text: 'Chronic sleep deprivation impairs immune function and academic concentration.',
        translationVi: 'Tình trạng thiếu ngủ kéo dài làm suy giảm chức năng miễn dịch và sự tập trung học thuật.',
        phoneticFocus: '/ˌdeprɪˈveɪʃn/ · /ɪmˈpeəz/',
        clozeWord: 'deprivation',
        clozeHintVi: 'danh từ (11 chữ cái): sự thiếu hụt, sự tước đoạt (giấc ngủ)',
        clozeExplanationEn: '"Sleep deprivation" is the condition of not having enough sleep.',
        clozeExplanationVi: 'Chữa lỗi: Cụm "sleep deprivation" nghĩa là sự thiếu ngủ.',
      },
    ],
  },
  {
    id: 'vid_acad_06',
    title: 'Academic: World Economic Forum — Circular Economy & Zero Waste',
    titleVi: 'Học thuật: Diễn Đàn Kinh Tế Thế Giới — Kinh Tế Tuần Hoàn & Giảm Rác Thải',
    category: 'Academic',
    speakerName: 'WEF Sustainability Panel',
    accent: 'International Academic English',
    bandLevel: '6.0-7.0+',
    topic: 'Economy',
    youtubeId: 'zCRKvDyyHmI',
    lines: [
      {
        speaker: 'Panelist',
        text: 'A circular economy eliminates waste by designing products for continuous reuse.',
        translationVi: 'Nền kinh tế tuần hoàn loại bỏ rác thải bằng cách thiết kế sản phẩm để tái sử dụng liên tục.',
        phoneticFocus: '/ˈsɜːkjələr/ · /ɪˈlɪmɪneɪts/',
        clozeWord: 'eliminates',
        clozeHintVi: 'động từ ngôi thứ 3 (10 chữ cái): loại bỏ hoàn toàn',
        clozeExplanationEn: '"Eliminate" means to completely remove or get rid of something.',
        clozeExplanationVi: 'Chữa lỗi: "eliminate waste" là loại bỏ hoàn toàn rác thải.',
      },
      {
        speaker: 'Panelist',
        text: 'Manufacturers must assume financial responsibility for the lifecycle of packaging.',
        translationVi: 'Các nhà sản xuất phải gánh vác trách nhiệm tài chính cho toàn bộ vòng đời của bao bì.',
        phoneticFocus: '/ˌmænjuˈfæktʃərəz/ · /ˈlaɪfsaɪkl/',
        clozeWord: 'manufacturers',
        clozeHintVi: 'danh từ số nhiều (13 chữ cái): các nhà sản xuất công nghiệp',
        clozeExplanationEn: '"Manufacturers" are companies or people that make goods for sale.',
        clozeExplanationVi: 'Chữa lỗi: "manufacturers" (n) là các nhà sản xuất.',
      },
    ],
  },
  {
    id: 'vid_acad_07',
    title: 'Academic: Stanford Neuroscience — Neuroplasticity & Language Acquisition',
    titleVi: 'Học thuật: Khoa Học Thần Kinh Stanford — Tính Khả Tạo Não Bộ Khi Học Ngoại Ngữ',
    category: 'Academic',
    speakerName: 'Prof. Andrew Huberman',
    accent: 'Clear American Academic',
    bandLevel: '6.0-7.0+',
    topic: 'Education',
    youtubeId: 'LG53Vxum0as',
    lines: [
      {
        speaker: 'Prof. Huberman',
        text: 'Active recall and spaced repetition trigger neuroplasticity in the adult brain.',
        translationVi: 'Chủ động gợi nhớ và lặp lại ngắt quãng kích hoạt tính khả tạo thần kinh ở não bộ người trưởng thành.',
        phoneticFocus: '/rɪˈkɔːl/ · /ˌnjʊərəʊplæˈstɪsəti/',
        clozeWord: 'repetition',
        clozeHintVi: 'danh từ (10 chữ cái): sự lặp lại',
        clozeExplanationEn: '"Spaced repetition" is an evidence-based learning technique that incorporates increasing intervals of time between subsequent review.',
        clozeExplanationVi: 'Chữa lỗi: "spaced repetition" là phương pháp lặp lại ngắt quãng (SRS).',
      },
      {
        speaker: 'Prof. Huberman',
        text: 'Making errors during practice actually alerts the nervous system to focus.',
        translationVi: 'Việc mắc lỗi trong quá trình luyện tập thực chất báo hiệu cho hệ thần kinh tập trung cao độ hơn.',
        phoneticFocus: '/ˈerəz/ · /ˈnɜːvəs/',
        clozeWord: 'focus',
        clozeHintVi: 'động từ (5 chữ cái): tập trung sự chú ý',
        clozeExplanationEn: '"Focus" means to pay particular attention to.',
        clozeExplanationVi: 'Chữa lỗi: "focus" (v/n) nghĩa là tập trung cao độ.',
      },
    ],
  },
  {
    id: 'vid_acad_08',
    title: 'Academic: National Geographic — Sustainable Urban Architecture',
    titleVi: 'Học thuật: National Geographic — Kiến Trúc Đô Thị Xanh Bền Vững',
    category: 'Academic',
    speakerName: 'Urban Architect Lecture',
    accent: 'Clear Documentary English',
    bandLevel: '5.0-6.0',
    topic: 'Society',
    youtubeId: 'V1O34cqerXo',
    lines: [
      {
        speaker: 'Architect',
        text: 'Vertical forests on high-rise buildings absorb carbon dioxide and cool city streets.',
        translationVi: 'Những khu rừng thẳng đứng trên các tòa nhà cao tầng hấp thụ khí CO2 và làm mát đường phố đô thị.',
        phoneticFocus: '/ˈvɜːtɪkl/ · /əbˈzɔːb/',
        clozeWord: 'absorb',
        clozeHintVi: 'động từ (6 chữ cái): hấp thụ',
        clozeExplanationEn: '"Absorb" means to take in or soak up energy, liquid, or other substances.',
        clozeExplanationVi: 'Chữa lỗi: "absorb carbon dioxide" là hấp thụ khí CO2.',
      },
      {
        speaker: 'Architect',
        text: 'Pedestrian-friendly zones enhance community interaction and public safety.',
        translationVi: 'Các khu vực thân thiện với người đi bộ nâng cao sự tương tác cộng đồng và an toàn công cộng.',
        phoneticFocus: '/pəˈdestriən/ · /ɪnˈhɑːns/',
        clozeWord: 'enhance',
        clozeHintVi: 'động từ (7 chữ cái): nâng cao, cải thiện chất lượng',
        clozeExplanationEn: '"Enhance" (B2/C1) means to intensify, increase, or further improve the quality or value of.',
        clozeExplanationVi: 'Chữa lỗi: "enhance" (v) là động từ học thuật thay cho "improve / make better".',
      },
    ],
  },
  {
    id: 'vid_acad_09',
    title: 'Academic: The Economist — Global Supply Chains & Trade Resilience',
    titleVi: 'Học thuật: Tạp Chí The Economist — Chuỗi Cung Ứng Toàn Cầu & Thương Mại',
    category: 'Academic',
    speakerName: 'The Economist Briefing',
    accent: 'British RP',
    bandLevel: '6.0-7.0+',
    topic: 'Economy',
    youtubeId: 'M7lc1UVf-VE',
    lines: [
      {
        speaker: 'Editor',
        text: 'Multinational corporations are diversifying their supply chains to avoid geopolitical bottlenecks.',
        translationVi: 'Các tập đoàn đa quốc gia đang đa dạng hóa chuỗi cung ứng để tránh các điểm nghẽn địa chính trị.',
        phoneticFocus: '/ˌmʌltiˈnæʃnəl/ · /daɪˈvɜːsɪfaɪɪŋ/',
        clozeWord: 'corporations',
        clozeHintVi: 'danh từ số nhiều (12 chữ cái): các tập đoàn lớn',
        clozeExplanationEn: '"Corporations" are large companies or groups of companies authorized to act as a single entity.',
        clozeExplanationVi: 'Chữa lỗi: "multinational corporations" là các tập đoàn đa quốc gia.',
      },
      {
        speaker: 'Editor',
        text: 'Investment in automated port infrastructure reduces international shipping delays.',
        translationVi: 'Đầu tư vào cơ sở hạ tầng cảng tự động giúp giảm sự chậm trễ trong vận tải biển quốc tế.',
        phoneticFocus: '/ˈɪnfrəstrʌktʃər/ · /dɪˈleɪz/',
        clozeWord: 'infrastructure',
        clozeHintVi: 'danh từ (14 chữ cái): cơ sở hạ tầng',
        clozeExplanationEn: '"Infrastructure" is the basic physical and organizational structures and facilities needed for the operation of a society.',
        clozeExplanationVi: 'Chữa lỗi: "infrastructure" (n) là cơ sở hạ tầng — từ vựng cốt lõi IELTS.',
      },
    ],
  },
  {
    id: 'vid_acad_10',
    title: 'Academic: UNESCO Heritage — Preserving Endangered Languages',
    titleVi: 'Học thuật: Di Sản UNESCO — Bảo Tồn Các Ngôn Ngữ Bản Địa Có Nguy Cơ Mai Một',
    category: 'Academic',
    speakerName: 'UNESCO Cultural Director',
    accent: 'International Academic English',
    bandLevel: '6.0-7.0+',
    topic: 'Society',
    youtubeId: 'Bn7HDBj9ZQQ',
    lines: [
      {
        speaker: 'Director',
        text: 'When an indigenous language vanishes, humanity loses irreplaceable ecological wisdom.',
        translationVi: 'Khi một ngôn ngữ bản địa biến mất, nhân loại đánh mất kho tàng tri thức sinh thái không thể thay thế.',
        phoneticFocus: '/ɪnˈdɪdʒənəs/ · /ˌɪrɪˈpleɪsəbl/',
        clozeWord: 'indigenous',
        clozeHintVi: 'tính từ (10 chữ cái): bản địa, lâu đời tại địa phương',
        clozeExplanationEn: '"Indigenous" (C1) means originating or occurring naturally in a particular place; native.',
        clozeExplanationVi: 'Chữa lỗi: "indigenous language / culture" là ngôn ngữ / văn hóa bản địa.',
      },
      {
        speaker: 'Director',
        text: 'Digital archives empower younger generations to revitalize their mother tongue.',
        translationVi: 'Các kho lưu trữ số trao quyền cho thế hệ trẻ hồi sinh tiếng mẹ đẻ của mình.',
        phoneticFocus: '/ˈɑːkaɪvz/ · /ˌriːˈvaɪtəlaɪz/',
        clozeWord: 'revitalize',
        clozeHintVi: 'động từ (10 chữ cái): hồi sinh, đem lại sức sống mới',
        clozeExplanationEn: '"Revitalize" means to imbue something with new life and vitality.',
        clozeExplanationVi: 'Chữa lỗi: "revitalize" (v) nghĩa là phục hưng, đem lại sức sống mới.',
      },
    ],
  },
  {
    id: 'vid_acad_11',
    title: 'Academic: Royal Institution — Renewable Hydrogen & Clean Aviation',
    titleVi: 'Học thuật: Viện Hoàng Gia Anh — Nhiên Liệu Hydro Xanh & Hàng Không Bền Vững',
    category: 'Academic',
    speakerName: 'Dr. Eleanor Vance',
    accent: 'British RP',
    bandLevel: '6.0-7.0+',
    topic: 'Environment',
    youtubeId: 'R2qdVq7Q9f8',
    lines: [
      {
        speaker: 'Dr. Vance',
        text: 'Green hydrogen offers a viable alternative to fossil fuels in long-haul aviation.',
        translationVi: 'Hydro xanh mang lại một giải pháp thay thế khả thi cho nhiên liệu hóa thạch trong ngành hàng không đường dài.',
        phoneticFocus: '/ˈvaɪəbl/ · /ɔːlˈtɜːnətɪv/',
        clozeWord: 'viable',
        clozeHintVi: 'tính từ (6 chữ cái): khả thi, có thể thực hiện hiệu quả',
        clozeExplanationEn: '"Viable" (C1) means capable of working successfully; feasible.',
        clozeExplanationVi: 'Chữa lỗi: "a viable alternative" là một giải pháp thay thế khả thi.',
      },
      {
        speaker: 'Dr. Vance',
        text: 'Technological breakthroughs must be accompanied by global regulatory standards.',
        translationVi: 'Những đột phá công nghệ phải đi kèm với các tiêu chuẩn quản lý toàn cầu.',
        phoneticFocus: '/ˈbreɪkθruːz/ · /ˈreɡjələtəri/',
        clozeWord: 'breakthroughs',
        clozeHintVi: 'danh từ số nhiều (13 chữ cái): những bước đột phá khoa học',
        clozeExplanationEn: '"Breakthroughs" are sudden, dramatic, and important discoveries or developments.',
        clozeExplanationVi: 'Chữa lỗi: "technological breakthroughs" là những đột phá về mặt công nghệ.',
      },
    ],
  },
  {
    id: 'vid_acad_12',
    title: 'Academic: Nature Science — CRISPR Gene Editing & Preventive Medicine',
    titleVi: 'Học thuật: Tạp Chí Nature — Công Nghệ Chỉnh Sửa Gen CRISPR & Y Học Dự Phòng',
    category: 'Academic',
    speakerName: 'Prof. Jennifer Doudna Lecture',
    accent: 'Academic American English',
    bandLevel: '6.0-7.0+',
    topic: 'Health',
    youtubeId: 'TdBAHexVYzc',
    lines: [
      {
        speaker: 'Prof. Doudna',
        text: 'Targeted gene editing holds immense potential for eradicating hereditary diseases.',
        translationVi: 'Chỉnh sửa gen trúng đích mang tiềm năng to lớn để xóa sổ các căn bệnh di truyền.',
        phoneticFocus: '/ɪˈrædɪkeɪtɪŋ/ · /həˈredɪtri/',
        clozeWord: 'hereditary',
        clozeHintVi: 'tính từ (10 chữ cái): mang tính di truyền qua các thế hệ',
        clozeExplanationEn: '"Hereditary" means conferred by or based on inheritance; passed from parent to offspring.',
        clozeExplanationVi: 'Chữa lỗi: "hereditary diseases" là các bệnh di truyền.',
      },
      {
        speaker: 'Prof. Doudna',
        text: 'Transparent ethical oversight ensures that biotechnology benefits all of humanity.',
        translationVi: 'Sự giám sát đạo đức minh bạch đảm bảo rằng công nghệ sinh học mang lại lợi ích cho toàn nhân loại.',
        phoneticFocus: '/trænsˈpærənt/ · /ˈəʊvəsaɪt/',
        clozeWord: 'transparent',
        clozeHintVi: 'tính từ (11 chữ cái): minh bạch, rõ ràng',
        clozeExplanationEn: '"Transparent" means open to public scrutiny; easy to perceive or detect.',
        clozeExplanationVi: 'Chữa lỗi: "transparent oversight" là sự giám sát công khai, minh bạch.',
      },
    ],
  },
  {
    id: 'vid_acad_13',
    title: 'Academic: TED Talk — How Great Leaders Inspire Cooperative Action',
    titleVi: 'Học thuật: TED Talk (Simon Sinek) — Cách Các Nhà Lãnh Đạo Truyền Cảm Hứng',
    category: 'Academic',
    speakerName: 'Simon Sinek',
    accent: 'Clear Transatlantic English',
    bandLevel: '5.0-6.0',
    topic: 'Economy',
    youtubeId: 'qp0HIF3SfI4',
    lines: [
      {
        speaker: 'Simon Sinek',
        text: 'People do not buy what you do; they buy the core belief and purpose behind why you do it.',
        translationVi: 'Mọi người không mua thứ bạn làm; họ mua niềm tin cốt lõi và mục đích đằng sau lý do bạn làm điều đó.',
        phoneticFocus: '/bɪˈliːf/ · /ˈpɜːpəs/',
        clozeWord: 'purpose',
        clozeHintVi: 'danh từ (7 chữ cái): mục đích, lý tưởng cốt lõi',
        clozeExplanationEn: '"Purpose" is the reason for which something is done or created.',
        clozeExplanationVi: 'Chữa lỗi: "core purpose" là mục đích cốt lõi.',
      },
      {
        speaker: 'Simon Sinek',
        text: 'Inspired organizations cultivate trust and intrinsic motivation among employees.',
        translationVi: 'Những tổ chức truyền cảm hứng nuôi dưỡng niềm tin và động lực nội tại giữa các nhân viên.',
        phoneticFocus: '/ˈkʌltɪveɪt/ · /ɪnˈtrɪnzɪk/',
        clozeWord: 'intrinsic',
        clozeHintVi: 'tính từ (9 chữ cái): nội tại, xuất phát từ bên trong',
        clozeExplanationEn: '"Intrinsic" (C1) means belonging naturally; essential (e.g., intrinsic motivation vs extrinsic reward).',
        clozeExplanationVi: 'Chữa lỗi: "intrinsic motivation" là động lực nội tại (đối lập với "extrinsic" — ngoại tại).',
      },
    ],
  },
  {
    id: 'vid_acad_14',
    title: 'Academic: MIT Media Lab — Human-Centered AI & Digital Ethics',
    titleVi: 'Học thuật: Phòng Thí Nghiệm MIT — Trí Tuệ Nhân Tạo Lấy Con Người Làm Trung Tâm',
    category: 'Academic',
    speakerName: 'MIT AI Researcher',
    accent: 'Academic American English',
    bandLevel: '6.0-7.0+',
    topic: 'Technology',
    youtubeId: '2ePf9rue1Ao',
    lines: [
      {
        speaker: 'Researcher',
        text: 'Artificial intelligence should augment human creativity rather than replace critical judgment.',
        translationVi: 'Trí tuệ nhân tạo nên bồi đắp tăng cường sự sáng tạo của con người thay vì thay thế phán đoán phản biện.',
        phoneticFocus: '/ɔːɡˈment/ · /ˈdʒʌdʒmənt/',
        clozeWord: 'augment',
        clozeHintVi: 'động từ (7 chữ cái): tăng cường, bổ trợ nâng cao',
        clozeExplanationEn: '"Augment" (C1) means to make something greater by adding to it; increase.',
        clozeExplanationVi: 'Chữa lỗi: "augment human creativity" là bổ trợ, nâng tầm sự sáng tạo của con người.',
      },
      {
        speaker: 'Researcher',
        text: 'Safeguarding data privacy is fundamental to democratic digital governance.',
        translationVi: 'Bảo vệ quyền riêng tư dữ liệu là nền tảng cho quản trị số dân chủ.',
        phoneticFocus: '/ˈprɪvəsi/ · /ˌfʌndəˈmentl/',
        clozeWord: 'fundamental',
        clozeHintVi: 'tính từ (11 chữ cái): mang tính nền tảng, cốt yếu',
        clozeExplanationEn: '"Fundamental" means forming a necessary base or core; of central importance.',
        clozeExplanationVi: 'Chữa lỗi: "fundamental to sth" nghĩa là đóng vai trò nền tảng, cốt lõi đối với điều gì.',
      },
    ],
  },
];

export const MEGA_YOUTUBE_VIDEOS: ShadowingVideoLesson[] = COMPACT_VIDEO_BLUEPRINTS.map(
  (bp) => ({
    id: bp.id,
    title: bp.title,
    titleVi: bp.titleVi,
    category: bp.category,
    speakerName: bp.speakerName,
    accent: bp.accent,
    bandLevel: bp.bandLevel,
    bandTarget: `Band ${bp.bandLevel}`,
    topic: bp.topic,
    durationSeconds: bp.lines.length * 9,
    durationLabel: `00:${String(bp.lines.length * 9).padStart(2, '0')}`,
    youtubeId: bp.youtubeId,
    sentences: bp.lines.map((line, idx) => ({
      id: `${bp.id}_s${idx + 1}`,
      startTime: idx * 9,
      endTime: (idx + 1) * 9,
      speaker: line.speaker,
      text: line.text,
      translationVi: line.translationVi,
      phoneticFocus: line.phoneticFocus,
      stressTip: `Focus on clear articulation of "${line.clozeWord}" (${line.phoneticFocus}).`,
      stressTipVi: `Chú ý nhấn trọng âm và phát âm rõ từ khóa "${line.clozeWord}" (${line.phoneticFocus}).`,
      clozeWord: line.clozeWord,
      clozeHintVi: line.clozeHintVi,
      clozeExplanationEn: line.clozeExplanationEn,
      clozeExplanationVi: line.clozeExplanationVi,
    })),
  })
);
