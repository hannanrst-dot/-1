import { SpellingItem, SpellingCategory, GradeLevel, GameMode } from '../types/game';

// Built-in Comprehensive Persian Spelling Educational Dataset
const DEFAULT_SPELLING_DATASET: SpellingItem[] = [
  // ------------------- Category: س / ص / ث -------------------
  {
    id: 's1',
    word: 'مدرسه',
    correctSpelling: 'مدرسه',
    incorrectVariants: ['مدرثه', 'مدرسح', 'مدرحسه'],
    incompleteForm: 'مـ د _ سـ ه',
    missingLetter: 'ر',
    decoyLetters: ['ز', 'د', 'س', 'ص'],
    meaning: 'محل درس خواندن، دانشکده یا آموزشگاه',
    ruleExplanation: '«مدرسه» از ریشه عربی (د-ر-س) و با حرف «س» نوشته می‌شود. نوشتن آن با «ث» یا «ص» غلط است.',
    audioPhrase: 'مدرسه، جایگاه دانش و یادگیری است.',
    hint: 'جای یادگیری و درس خواندن است.',
    category: 's_s_th',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 's2',
    word: 'صابون',
    correctSpelling: 'صابون',
    incorrectVariants: ['سابون', 'ثابون'],
    incompleteForm: 'صـ ا _ و ن',
    missingLetter: 'ب',
    decoyLetters: ['پ', 'ت', 'ث', 'س'],
    meaning: 'ماده شوینده برای تمیزی دست و صورت',
    ruleExplanation: '«صابون» با حرف «ص» آغاز می‌شود. نوشتن آن با «س» یا «ث» نادرست است.',
    audioPhrase: 'صابون، برای شستن و نظافت به کار می‌رود.',
    hint: 'کف می‌کند و دست‌ها را تمیز می‌کند.',
    category: 's_s_th',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 's3',
    word: 'کثیف',
    correctSpelling: 'کثیف',
    incorrectVariants: ['کسیف', 'کصیف'],
    incompleteForm: 'کـ _ یـ ف',
    missingLetter: 'ث',
    decoyLetters: ['س', 'ص', 'ت', 'ش'],
    meaning: 'آلوده، ناپاک، ضد تمیز',
    ruleExplanation: '«کثیف» به معنای آلوده و متضاد تمیز، با حرف «ث» نوشته می‌شود.',
    audioPhrase: 'کثیف، یعنی آلوده و ناپاک.',
    hint: 'مخالف تمیز و پاکیزه است.',
    category: 's_s_th',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 's4',
    word: 'ثروت',
    correctSpelling: 'ثروت',
    incorrectVariants: ['سروت', 'صروت'],
    incompleteForm: 'ثـ _ و ت',
    missingLetter: 'ر',
    decoyLetters: ['ز', 'ژ', 'س', 'د'],
    meaning: 'دارایی فراوان، مال و مکنت',
    ruleExplanation: '«ثروت» با حرف «ث» نوشته می‌شود. علم از ثروت بالاتر است.',
    audioPhrase: 'ثروت، به معنای دارایی و مال فراوان است.',
    hint: 'مال و دارایی بسیار.',
    category: 's_s_th',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 's5',
    word: 'قصه',
    correctSpelling: 'قصه',
    incorrectVariants: ['قسه', 'قثه', 'غصه'],
    incompleteForm: 'قـ _ ـه',
    missingLetter: 'ص',
    decoyLetters: ['س', 'ث', 'ت', 'ش'],
    meaning: 'داستان، سرگذشت و حکایت',
    ruleExplanation: '«قصه» به معنی داستان با «ق» و «ص» نوشته می‌شود (با غصه به معنی غم اشتباه نشود).',
    audioPhrase: 'قصه، داستان شیرین مادربزرگ.',
    hint: 'داستان سرگرم‌کننده شبانه.',
    category: 's_s_th',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 's6',
    word: 'صبر',
    correctSpelling: 'صبر',
    incorrectVariants: ['سبر', 'ثبر'],
    incompleteForm: 'صـ _ ر',
    missingLetter: 'ب',
    decoyLetters: ['پ', 'ت', 'ث', 'د'],
    meaning: 'شکیبایی، بردباری و تامل',
    ruleExplanation: '«صبر» با حرف «ص» نوشته می‌شود و به معنی شکیبایی است.',
    audioPhrase: 'صبر، کلید پیروزی در سختی‌هاست.',
    hint: 'شکیبایی در برابر سختی‌ها.',
    category: 's_s_th',
    grade: 'grade_1_2',
    difficulty: 1,
  },

  // ------------------- Category: ز / ض / ظ / ذ -------------------
  {
    id: 'z1',
    word: 'گزارش',
    correctSpelling: 'گزارش',
    incorrectVariants: ['گوزاش', 'گذارش', 'گضارش'],
    incompleteForm: 'گـ _ ا ر ش',
    missingLetter: 'ز',
    decoyLetters: ['ذ', 'ض', 'ظ', 'ژ'],
    meaning: 'بیان و شرح یک رویداد یا خبر',
    ruleExplanation: '«گزارش» از ریشه گذاردن/گزاردن در معنای ادا کردن و شرح دادن، با «ز» نوشته می‌شود نه با «ذ».',
    audioPhrase: 'گزارش، شرح و بیان یک رخداد است.',
    hint: 'خبرنگار آن را تهیه و بازگو می‌کند.',
    category: 'z_z_z_z',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'z2',
    word: 'ضبط',
    correctSpelling: 'ضبط',
    incorrectVariants: ['زبط', 'ظبط', 'ذبط'],
    incompleteForm: 'ضـ _ ط',
    missingLetter: 'ب',
    decoyLetters: ['پ', 'ت', 'ث', 'د'],
    meaning: 'ثبت صدا، نگهداری و ثبت کردن',
    ruleExplanation: '«ضبط» با حرف «ض» آغاز و با «ط» پایان می‌یابد. زبط کاملاً نادرست است.',
    audioPhrase: 'ضبط صوت، صداها را ذخیره می‌کند.',
    hint: 'ثبت و ذخیره کردن صدا یا تصویر.',
    category: 'z_z_z_z',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'z3',
    word: 'ناظم',
    correctSpelling: 'ناظم',
    incorrectVariants: ['نازم', 'ناضم', 'ناذم'],
    incompleteForm: 'نـ ا _ م',
    missingLetter: 'ظ',
    decoyLetters: ['ز', 'ض', 'ذ', 'ط'],
    meaning: 'برقرارکننده نظم، مسئول انضباط در مدرسه',
    ruleExplanation: '«ناظم» هم‌ریشه با نظم و انضباط است و حتماً با حرف «ظ» نوشته می‌شود.',
    audioPhrase: 'ناظم، نظم و آرامش را برقرار می‌کند.',
    hint: 'در مدرسه به رعایت نظم کمک می‌کند.',
    category: 'z_z_z_z',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'z4',
    word: 'گذشته',
    correctSpelling: 'گذشته',
    incorrectVariants: ['گزشته', 'گضشته', 'گظشته'],
    incompleteForm: 'گـ _ شـ تـ ه',
    missingLetter: 'ذ',
    decoyLetters: ['ز', 'ض', 'ظ', 'د'],
    meaning: 'زمان سپری‌شده، تاریخ پشت سر گذاشته',
    ruleExplanation: '«گذشته» از مصدر گذشتن (عبور کردن)، با حرف «ذ» نوشته می‌شود نه با «ز».',
    audioPhrase: 'گذشته، زمان سپری شده است.',
    hint: 'زمانی که سپری شده و رفته است.',
    category: 'z_z_z_z',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'z5',
    word: 'لذیذ',
    correctSpelling: 'لذیذ',
    incorrectVariants: ['لزیز', 'لضیض', 'لظیظ'],
    incompleteForm: 'لـ _ یـ ذ',
    missingLetter: 'ذ',
    decoyLetters: ['ز', 'ض', 'ظ', 'د'],
    meaning: 'خوشمزه، گوارا و دلچسب',
    ruleExplanation: '«لذیذ» دارای دو حرف «ذ» است و نوشتن آن با «ز» نادرست است.',
    audioPhrase: 'غذای لذیذ و بسیار خوشمزه.',
    hint: 'غذایی که طعم بسیار عالی دارد.',
    category: 'z_z_z_z',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'z6',
    word: 'منظره',
    correctSpelling: 'منظره',
    incorrectVariants: ['منزره', 'منضره', 'منذره'],
    incompleteForm: 'مـ نـ _ ر ه',
    missingLetter: 'ظ',
    decoyLetters: ['ز', 'ض', 'ذ', 'ط'],
    meaning: 'چشم‌انداز زیبا، صحنه طبیعت',
    ruleExplanation: '«منظره» از ریشه نظر (دیدن) و با حرف «ظ» است.',
    audioPhrase: 'منظره زیبای کوهستان در بهار.',
    hint: 'چشم‌انداز و دید زیبای طبیعت.',
    category: 'z_z_z_z',
    grade: 'grade_3_4',
    difficulty: 2,
  },

  // ------------------- Category: ت / ط -------------------
  {
    id: 't1',
    word: 'طوطی',
    correctSpelling: 'طوطی',
    incorrectVariants: ['توتی', 'طوتی', 'توطی'],
    incompleteForm: 'طـ و _ ی',
    missingLetter: 'ط',
    decoyLetters: ['ت', 'ظ', 'ص', 'د'],
    meaning: 'پرنده سخنگو با پرهای رنگارنگ',
    ruleExplanation: '«طوطی» با دو حرف «ط» نوشته می‌شود و نوشتن آن با «ت» نادرست است.',
    audioPhrase: 'طوطی، پرنده‌ای شیرین‌زبان و زیباست.',
    hint: 'پرنده‌ای باهوش که حرف زدن را تقلید می‌کند.',
    category: 't_t',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 't2',
    word: 'اتاق',
    correctSpelling: 'اتاق',
    incorrectVariants: ['اطاق'],
    incompleteForm: 'ا _ ا ق',
    missingLetter: 'ت',
    decoyLetters: ['ط', 'د', 'ث', 'ظ'],
    meaning: 'فضای بسته و خانه در یک ساختمان',
    ruleExplanation: 'در فرهنگستان زبان فارسی، املای ترجیحی و مصوب «اتاق» با «ت» است.',
    audioPhrase: 'اتاق تمیز و پر از نور خورشید.',
    hint: 'بخشی از خانه که در آن استراحت می‌کنیم.',
    category: 't_t',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 't3',
    word: 'حیاط',
    correctSpelling: 'حیاط',
    incorrectVariants: ['حیات', 'هیاط', 'هیات'],
    incompleteForm: 'حـ یـ ا _',
    missingLetter: 'ط',
    decoyLetters: ['ت', 'ظ', 'ض', 'د'],
    meaning: 'محوطه باز و باغچه خانه',
    ruleExplanation: '«حیاط» به معنی محوطه و باغچه با «ط» و «ح» است (اما حیات به معنی زندگی با «ت» است).',
    audioPhrase: 'حیاط پر از گل و درختان سرسبز.',
    hint: 'محوطه باز خانه که در آن بازی می‌کنیم.',
    category: 't_t',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 't4',
    word: 'طبیعت',
    correctSpelling: 'طبیعت',
    incorrectVariants: ['تبیعت', 'طبیات', 'تبیات'],
    incompleteForm: 'طـ بـ یـ _ ت',
    missingLetter: 'ع',
    decoyLetters: ['ا', 'ه', 'ح', 'ت'],
    meaning: 'جهان آفرینش، کوه و جنگل و دریا',
    ruleExplanation: '«طبیعت» با حرف «ط» آغاز می‌شود و با «ت» به پایان می‌رسد.',
    audioPhrase: 'طبیعت، سرشار از زیبایی و شگفتی است.',
    hint: 'دشت و کوه و دامنه‌های سبز.',
    category: 't_t',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 't5',
    word: 'بلیت',
    correctSpelling: 'بلیت',
    incorrectVariants: ['بلیط', 'بلیت'],
    incompleteForm: 'بـ لـ یـ _',
    missingLetter: 'ت',
    decoyLetters: ['ط', 'د', 'ث', 'پ'],
    meaning: 'برگه ورود به سینما، قطار یا هواپیما',
    ruleExplanation: 'بر اساس مصوبه فرهنگستان زبان فارسی املای استاندارد این واژه «بلیت» با «ت» است.',
    audioPhrase: 'بلیت سفر به مشهد مقدس.',
    hint: 'برگه‌ای که برای سوار شدن به قطار یا ورود به سینما می‌خریم.',
    category: 't_t',
    grade: 'grade_5_6',
    difficulty: 2,
  },

  // ------------------- Category: غ / ق -------------------
  {
    id: 'gh1',
    word: 'قورباغه',
    correctSpelling: 'قورباغه',
    incorrectVariants: ['غورباغه', 'قورباقه', 'غورباقه'],
    incompleteForm: 'قـ و ر بـ ا _ ه',
    missingLetter: 'غ',
    decoyLetters: ['ق', 'ع', 'گ', 'ک'],
    meaning: 'جانور دوزیست جهنده و برکه‌نشین',
    ruleExplanation: '«قورباغه» در آغاز با «ق» و در میانه با «غ» نوشته می‌شود.',
    audioPhrase: 'قورباغه در برکه آواز می‌خواند.',
    hint: 'جانوری جهنده با صدای قور قور در آبگیر.',
    category: 'gh_gh',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'gh2',
    word: 'غذا',
    correctSpelling: 'غذا',
    incorrectVariants: ['قذا', 'غزا', 'قزا'],
    incompleteForm: 'غـ _ ا',
    missingLetter: 'ذ',
    decoyLetters: ['ز', 'ض', 'ظ', 'د'],
    meaning: 'خوراک، طعام و مواد مقوی',
    ruleExplanation: '«غذا» با حرف «غ» آغاز و با «ذ» نوشته می‌شود نه با «ق» یا «ز».',
    audioPhrase: 'غذای گرم و لذیذ روی سفره.',
    hint: 'چیزی که می‌خوریم تا انرژی بگیریم.',
    category: 'gh_gh',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'gh3',
    word: 'قاشق',
    correctSpelling: 'قاشق',
    incorrectVariants: ['غاشق', 'قاشغ', 'غاشغ'],
    incompleteForm: 'قـ ا شـ _',
    missingLetter: 'ق',
    decoyLetters: ['غ', 'ک', 'گ', 'ف'],
    meaning: 'ابزار غذا خوردن همراه با چنگال',
    ruleExplanation: '«قاشق» با دو حرف «ق» در آغاز و پایان نوشته می‌شود.',
    audioPhrase: 'قاشق و چنگال برای صرف غذا.',
    hint: 'ابزاری که با آن سوپ و غذا می‌خوریم.',
    category: 'gh_gh',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'gh4',
    word: 'غبار',
    correctSpelling: 'غبار',
    incorrectVariants: ['قبار', 'گبار'],
    incompleteForm: 'غـ _ ا ر',
    missingLetter: 'ب',
    decoyLetters: ['پ', 'ت', 'ث', 'د'],
    meaning: 'گرد و خاک در هوا',
    ruleExplanation: '«غبار» به معنای گرد و خاک با حرف «غ» نوشته می‌شود.',
    audioPhrase: 'غبار آسمان را پوشانده بود.',
    hint: 'گرد و خاک ریز معلق در هوا.',
    category: 'gh_gh',
    grade: 'grade_3_4',
    difficulty: 2,
  },

  // ------------------- Category: ه / ح -------------------
  {
    id: 'h1',
    word: 'حوله',
    correctSpelling: 'حوله',
    incorrectVariants: ['هوله', 'حله', 'هولح'],
    incompleteForm: 'حـ _ لـ ه',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ی', 'ه', 'ع'],
    meaning: 'پارچه نرم و پرزدار برای خشک کردن تن و دست',
    ruleExplanation: '«حوله» با «ح» (جیمی) آغاز می‌شود و با «ه» پایان می‌پذیرد.',
    audioPhrase: 'حوله لطیف برای خشک کردن صورت.',
    hint: 'پارچه‌ای پرزدار برای خشک کردن دست و صورت بعد از شستن.',
    category: 'h_h',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'h2',
    word: 'صبح',
    correctSpelling: 'صبح',
    incorrectVariants: ['سبح', 'صبه', 'سبه'],
    incompleteForm: 'صـ _ ح',
    missingLetter: 'ب',
    decoyLetters: ['پ', 'ت', 'ث', 'د'],
    meaning: 'آغاز روز، هنگام برآمدن خورشید',
    ruleExplanation: '«صبح» با «ص» آغاز و با «ح» پایان می‌یابد.',
    audioPhrase: 'صبح زیبای بهاری با نسیم خنک.',
    hint: 'آغاز روز و طلوع آفتاب.',
    category: 'h_h',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'h3',
    word: 'مهربان',
    correctSpelling: 'مهربان',
    incorrectVariants: ['محربان', 'محروبان'],
    incompleteForm: 'مـ _ ر بـ ا ن',
    missingLetter: 'ه',
    decoyLetters: ['ح', 'ع', 'خ', 'گ'],
    meaning: 'دارای محبت، دلسوز و خوش‌برخورد',
    ruleExplanation: '«مهربان» از ریشه مهر (محبت و خورشید) و با «هـ» دوچشم نوشته می‌شود.',
    audioPhrase: 'معلم مهربان و دلسوز ما.',
    hint: 'کسی که پر از مهر و محبت و دوستی است.',
    category: 'h_h',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'h4',
    word: 'حیوان',
    correctSpelling: 'حیوان',
    incorrectVariants: ['هیوان', 'حیووان'],
    incompleteForm: 'حـ یـ _ ا ن',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ه', 'ر', 'د'],
    meaning: 'جانور، موجود زنده غیر انسان',
    ruleExplanation: '«حیوان» با «ح» جیمی نوشته می‌شود و هم‌ریشه با حیات است.',
    audioPhrase: 'حیوانات جنگل در آرامش زندگی می‌کنند.',
    hint: 'جانداری مانند شیر، اسب یا گنجشک.',
    category: 'h_h',
    grade: 'grade_1_2',
    difficulty: 1,
  },

  // ------------------- Category: خوا / خا -------------------
  {
    id: 'kh1',
    word: 'خواستن',
    correctSpelling: 'خواستن',
    incorrectVariants: ['خاستن'],
    incompleteForm: 'خـ _ ا سـ تـ ن',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ه', 'ی', 'ع'],
    meaning: 'طلب کردن، میل داشتن و اراده نمودن',
    ruleExplanation: '«خواستن» به معنی میل و طلب با «واو معدوله» نوشته می‌شود (خاستن با الف به معنی بلند شدن است).',
    audioPhrase: 'خواستن، توانستن است.',
    hint: 'به معنی طلب کردن و آرزو داشتن.',
    category: 'khva',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'kh2',
    word: 'خواهش',
    correctSpelling: 'خواهش',
    incorrectVariants: ['خاهش', 'خاهیش'],
    incompleteForm: 'خـ _ ا هـ ش',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ه', 'ی', 'ع'],
    meaning: 'تقاضا و درخواست محترمانه',
    ruleExplanation: '«خواهش» دارای «واو معدوله» است که نوشته می‌شود ولی تلفظ آن کوتاه است.',
    audioPhrase: 'خواهش می‌کنم بفرمایید.',
    hint: 'تقاضا و درخواستی محترمانه و زیبا.',
    category: 'khva',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'kh3',
    word: 'خواب',
    correctSpelling: 'خواب',
    incorrectVariants: ['خاب', 'خاواب'],
    incompleteForm: 'خـ _ ا ب',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ه', 'ی', 'پ'],
    meaning: 'استراحت شبانه، رویای شیرین',
    ruleExplanation: '«خواب» دارای «واو معدوله» است و نوشتن آن به صورت «خاب» کاملاً غلط است.',
    audioPhrase: 'خواب راحت و آرام در دل شب.',
    hint: 'استراحت با چشمان بسته هنگام شب.',
    category: 'khva',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'kh4',
    word: 'خواهر',
    correctSpelling: 'خواهر',
    incorrectVariants: ['خاهر', 'خاوهر'],
    incompleteForm: 'خـ _ ا هـ ر',
    missingLetter: 'و',
    decoyLetters: ['ا', 'ه', 'ی', 'ع'],
    meaning: 'همشیره، دختر خانواده نسبت به برادر یا خواهر',
    ruleExplanation: '«خواهر» دارای واو ناخوانده (واو معدوله) است.',
    audioPhrase: 'خواهر مهربان و فداکار.',
    hint: 'عضو خانواده و همشیره.',
    category: 'khva',
    grade: 'grade_1_2',
    difficulty: 1,
  },

  // ------------------- Category: تشدید و تنوین -------------------
  {
    id: 'tash1',
    word: 'معلم',
    correctSpelling: 'معلّم',
    incorrectVariants: ['معلمم', 'معلم'],
    incompleteForm: 'مـ _ لـ ـم',
    missingLetter: 'ع',
    decoyLetters: ['ا', 'ه', 'ح', 'غ'],
    meaning: 'آموزگار، آموزاننده دانش',
    ruleExplanation: '«معلّم» دارای تشدید بر روی حرف «ل» است و از ریشه تعلیم و علم می‌باشد.',
    audioPhrase: 'معلم دانشمند و چراغ راه دانش.',
    hint: 'آموزگار مهربانی که به ما درس می‌آموزد.',
    category: 'tashdid',
    grade: 'grade_1_2',
    difficulty: 1,
  },
  {
    id: 'tash2',
    word: 'حتماً',
    correctSpelling: 'حتماً',
    incorrectVariants: ['حتمن', 'حتمان'],
    incompleteForm: 'حـ تـ مـ _',
    missingLetter: 'اً',
    decoyLetters: ['ن', 'ان', 'نَ', 'ت'],
    meaning: 'یقیناً، بدون شک و قطعی',
    ruleExplanation: '«حتماً» دارای تنوین نصب (اً) در پایان کلمه است و نوشتن آن به صورت «حتمن» نادرست است.',
    audioPhrase: 'حتماً فردا به دیدارت خواهم آمد.',
    hint: 'کلمه‌ای به معنای قطعاً و بی‌تردید.',
    category: 'tashdid',
    grade: 'grade_3_4',
    difficulty: 2,
  },
  {
    id: 'tash3',
    word: 'اصلاً',
    correctSpelling: 'اصلاً',
    incorrectVariants: ['اصلن', 'اسلن', 'اصلا'],
    incompleteForm: 'ا صـ لـ _',
    missingLetter: 'اً',
    decoyLetters: ['ن', 'ان', 'م', 'ت'],
    meaning: 'به هیچ وجه، در پایه و اساس',
    ruleExplanation: '«اصلاً» با تنوین نصب در انتها و حرف «ص» نوشته می‌شود.',
    audioPhrase: 'من اصلاً نگران نیستم.',
    hint: 'به معنی هرگز و به هیچ عنوان.',
    category: 'tashdid',
    grade: 'grade_3_4',
    difficulty: 2,
  },
];

// Content Adapter Class
export class SpellingContentAdapter {
  private customItems: SpellingItem[] = [];

  constructor() {
    this.loadCustomItems();
  }

  private loadCustomItems(): void {
    try {
      const saved = localStorage.getItem('word_hunter_custom_words');
      if (saved) {
        this.customItems = JSON.parse(saved);
      }
    } catch {
      // LocalStorage fallback
      this.customItems = [];
    }
  }

  public getAllItems(): SpellingItem[] {
    return [...DEFAULT_SPELLING_DATASET, ...this.customItems];
  }

  public getFilteredItems(
    category: SpellingCategory = 'all',
    grade: GradeLevel = 'all',
    difficulty?: number
  ): SpellingItem[] {
    let items = this.getAllItems();

    if (category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    if (grade !== 'all') {
      items = items.filter((item) => item.grade === grade || item.grade === 'all');
    }

    if (difficulty) {
      items = items.filter((item) => item.difficulty === difficulty);
    }

    // Return all items or fallback if empty
    return items.length > 0 ? items : DEFAULT_SPELLING_DATASET;
  }

  public getRandomItem(
    category: SpellingCategory = 'all',
    grade: GradeLevel = 'all',
    difficulty?: number
  ): SpellingItem {
    const pool = this.getFilteredItems(category, grade, difficulty);
    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  public getItemById(id: string): SpellingItem | undefined {
    return this.getAllItems().find((item) => item.id === id);
  }

  public addCustomItem(item: Omit<SpellingItem, 'id'>): SpellingItem {
    const newItem: SpellingItem = {
      ...item,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.customItems.push(newItem);
    this.saveCustomItems();
    return newItem;
  }

  public removeCustomItem(id: string): boolean {
    const prevLen = this.customItems.length;
    this.customItems = this.customItems.filter((item) => item.id !== id);
    this.saveCustomItems();
    return this.customItems.length < prevLen;
  }

  public clearCustomItems(): void {
    this.customItems = [];
    this.saveCustomItems();
  }

  private saveCustomItems(): void {
    try {
      localStorage.setItem('word_hunter_custom_words', JSON.stringify(this.customItems));
    } catch (e) {
      console.warn('Failed to save custom words to storage', e);
    }
  }

  public getCategoryDisplayName(cat: SpellingCategory): string {
    switch (cat) {
      case 's_s_th':
        return 'حروف س / ص / ث';
      case 'z_z_z_z':
        return 'حروف ز / ض / ظ / ذ';
      case 't_t':
        return 'حروف ت / ط';
      case 'gh_gh':
        return 'حروف غ / ق';
      case 'h_h':
        return 'حروف ه / ح';
      case 'khva':
        return 'واو معدوله (خوا / خا)';
      case 'tashdid':
        return 'تشدید و تنوین (ـّ / اً)';
      case 'all':
      default:
        return 'همه دسته‌بندی‌ها';
    }
  }

  public getGradeDisplayName(grade: GradeLevel): string {
    switch (grade) {
      case 'grade_1_2':
        return 'پایه اول و دوم ابتدایی';
      case 'grade_3_4':
        return 'پایه سوم و چهارم ابتدایی';
      case 'grade_5_6':
        return 'پایه پنجم و ششم ابتدایی';
      case 'middle_school':
        return 'دوره اول متوسطه';
      case 'all':
      default:
        return 'همه پایه‌های تحصیلی';
    }
  }

  public getGameModeDisplayName(mode: GameMode): { fa: string; desc: string; icon: string } {
    switch (mode) {
      case 'word_hunt':
        return {
          fa: 'شکار کلمه',
          desc: 'پرتاب به سوی کلمات معلق و تشخیص املای درست از غلط',
          icon: '🏹',
        };
      case 'letter_snipe':
        return {
          fa: 'تیراندازی به حرف',
          desc: 'تکمیل جای خالی کلمه با شکار حرف درست در آسمان',
          icon: '🔤',
        };
      case 'word_rescue':
        return {
          fa: 'نجات کلمه',
          desc: 'آزادسازی کلمه طلایی اسیر شده با شکستن قفل حروف غلط',
          icon: '🛡️',
        };
      case 'monster_combat':
        return {
          fa: 'شکار غلط املایی',
          desc: 'شلیک به هیولای حامل غلط املایی و تبدیل آن به موجود مهربان',
          icon: '👾',
        };
      case 'audio_whisper':
        return {
          fa: 'املا شنیداری',
          desc: 'شنیدن صدای زمزمه کلمه و شکار هدف درست بدون نمایش اولیه',
          icon: '🎧',
        };
      case 'speed_rush':
        return {
          fa: 'حمله زمان‌دار',
          desc: 'شکار اهداف سریع پرتال‌ها با دقت و سرعت عمل بالا',
          icon: '⚡',
        };
      case 'boss_battle':
        return {
          fa: 'نبرد با هیولای غلط‌نویس',
          desc: 'مبارزه چندمرحله‌ای حماسی با غول بیابان املایی',
          icon: '👑',
        };
      default:
        return { fa: 'بازی آزاد', desc: '', icon: '🎯' };
    }
  }
}

export const spellingContentAdapter = new SpellingContentAdapter();
