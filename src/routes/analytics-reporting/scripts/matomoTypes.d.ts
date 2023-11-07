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
    sessions: number,
    totalRevenue: number,
    conversionRate: string,
    unBouncedSessions: number,
    bouncedSessions: number,
    avgSessionLength: number,
    consultationsBooked: number,
    totalConsultationValue: number,
    surveysBooked: number,
    totalSurveyValue: number,
    preorderNum: number,
    preorderVal: number,
    expressNum: number,
    expressVal: number,
}