// src/ai/flows/legal-compliance-report.ts
'use server';

/**
 * @fileOverview Generates a legal compliance report for property conditions based on current regulations.
 *
 * - generateLegalComplianceReport - A function that generates the legal compliance report.
 * - LegalComplianceReportInput - The input type for the generateLegalComplianceReport function.
 * - LegalComplianceReportOutput - The return type for the generateLegalComplianceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LegalComplianceReportInputSchema = z.object({
  propertyConditions: z
    .string()
    .describe('Detailed description of the property conditions.'),
  currentRegulations: z
    .string()
    .describe('The current legal regulations applicable to rental properties.'),
});
export type LegalComplianceReportInput = z.infer<typeof LegalComplianceReportInputSchema>;

const LegalComplianceReportOutputSchema = z.object({
  complianceSummary: z
    .string()
    .describe(
      'A summary of the property conditions compliance with current regulations.'
    ),
  recommendations: z
    .string()
    .describe('Recommendations for ensuring full legal compliance.'),
});
export type LegalComplianceReportOutput = z.infer<typeof LegalComplianceReportOutputSchema>;

export async function generateLegalComplianceReport(
  input: LegalComplianceReportInput
): Promise<LegalComplianceReportOutput> {
  return legalComplianceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalComplianceReportPrompt',
  input: {schema: LegalComplianceReportInputSchema},
  output: {schema: LegalComplianceReportOutputSchema},
  prompt: `You are an expert in property law and regulations.

You will receive a description of the property conditions and the current legal regulations.
Your task is to analyze the property conditions against the regulations and provide a compliance summary and recommendations for ensuring full legal compliance.

Property Conditions: {{{propertyConditions}}}

Current Regulations: {{{currentRegulations}}}

Compliance Summary:
Recommendations: `,
});

const legalComplianceReportFlow = ai.defineFlow(
  {
    name: 'legalComplianceReportFlow',
    inputSchema: LegalComplianceReportInputSchema,
    outputSchema: LegalComplianceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
