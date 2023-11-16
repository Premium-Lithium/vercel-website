interface SummaryMetadata { // used to help construct reports automatically
    name: String,
    prefix?: String,
    suffix?: String,
}

// handle different data types

interface SummaryNumber extends SummaryMetadata {
    value: number,
}

interface SummaryString extends SummaryMetadata {
    value: String,
}

export interface MatomoAPIOpts {
    siteID?: number;
    period?: 'day' | 'week' | 'month' | 'year' | 'range';
    date?: 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear' | string;
    segment?: string;
    format?: 'xml' | 'json' | 'csv' | 'tsv' | 'html' | 'original';
    filterLimit?: number;
    expanded?: '0' | '1';
    flat?: '0' | '1';
    additionalOpts?: Array<Array<string>>; // any other params, will jsut be passed through
}

export interface DataSummary {
    sessions: number;
    totalSessionTime: number;
    avgSessionTime: number;
    numConsultationsBooked: number;
    totalConsultationValue: number;
    numSurveysBooked: number;
    totalSurveyValue: number;
    conversionRate: string;
    sessionValue: number;
    sessionValuePerMinute: number;
}

export interface EnergiserSummary {
    sessions: SummaryNumber,
    totalRevenue: SummaryNumber,
    conversionRate: SummaryString,
    unBouncedSessions: SummaryNumber,
    bouncedSessions: SummaryNumber,
    avgSessionLength: SummaryNumber,
    consultationsBooked: SummaryNumber,
    totalConsultationValue: SummaryNumber,
    surveysBooked: SummaryNumber,
    totalSurveyValue: SummaryNumber,
    preorderNum: SummaryNumber,
    preorderVal: SummaryNumber,
    expressNum: SummaryNumber,
    expressVal: SummaryNumber,
}