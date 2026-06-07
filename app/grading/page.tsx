"use client";

import React, { useState } from 'react';
import { GRADING_STANDARDS, Grade } from '../../lib/grading-standards';
import { GradeBadge, GradeCriteriaModal } from '../../components/grading/GradeBadge';
import Image from 'next/image';

const COMMODITIES: string[] = Object.keys(GRADING_STANDARDS);

export default function GradingPage() {
  const [step, setStep] = useState<number>(1);
  const [commodity, setCommodity] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [criteriaChecked, setCriteriaChecked] = useState<boolean[]>([]);
  const [suggestedGrade, setSuggestedGrade] = useState<Grade | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [badgeUrl, setBadgeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Step 1: Select commodity and upload photos

  function handleCommodityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCommodity(e.target.value);
    setCriteriaChecked([]);
    setSuggestedGrade(null);
  }


  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length < 3 || files.length > 6) {
      setError('Please upload 3 to 6 photos.');
      return;
    }
    setPhotos(files);
    setError('');
  }

  // Step 2: Self-assessment checklist

  function handleCriteriaChange(idx: number) {
    setCriteriaChecked((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  }

  // Step 3: Suggest grade

  function suggestGrade() {
    if (!commodity) return;
    const standards = GRADING_STANDARDS[commodity];
    // Find the highest grade where all criteria are checked
    let offset = 0;
    for (const grade of ['A', 'B', 'C'] as Grade[]) {
      const criteria = standards[grade].criteria;
      const checked = criteria.map((_: unknown, i: number) => criteriaChecked[i + offset]);
      if (checked.every(Boolean)) {
        setSuggestedGrade(grade);
        return;
      }
      offset += criteria.length;
    }
    setSuggestedGrade('C');
  }

  // Step 4: Submit grading

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      throw new Error('Grading submission is not enabled yet. Connect storage and grading APIs before going live.');
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // UI

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Produce Quality Grading</h1>
      {step === 1 && (
        <div>
          <label className="block mb-2">Select Commodity</label>
          <select value={commodity} onChange={handleCommodityChange} className="border rounded p-2 mb-4 w-full" aria-label="Select commodity">
            <option value="">-- Select --</option>
            {COMMODITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="block mb-2">Upload Photos (3-6)</label>
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="mb-4" aria-label="Upload produce photos" />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!commodity || photos.length < 3 || photos.length > 6}
            onClick={() => setStep(2)}
          >
            Next: Self-Assessment
          </button>
        </div>
      )}
      {step === 2 && commodity && (
        <div>
          <h2 className="font-semibold mb-2">Self-Assessment Checklist</h2>
          {(['A', 'B', 'C'] as Grade[]).map((grade) => {
            const criteria = GRADING_STANDARDS[commodity][grade].criteria;
            let offset = 0;
            if (grade === 'B') offset = GRADING_STANDARDS[commodity]['A'].criteria.length;
            if (grade === 'C') offset = GRADING_STANDARDS[commodity]['A'].criteria.length + GRADING_STANDARDS[commodity]['B'].criteria.length;
            return (
              <div key={grade} className="mb-2">
                <div className="font-bold">Grade {grade}: {GRADING_STANDARDS[commodity][grade].label}</div>
                <ul className="ml-4">
                  {criteria.map((crit: string, idx: number) => (
                    <li key={crit}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!criteriaChecked[idx + offset]}
                          onChange={() => handleCriteriaChange(idx + offset)}
                          className="mr-2"
                        />
                        {crit}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={() => { suggestGrade(); setStep(3); }}>
            Next: Suggest Grade
          </button>
        </div>
      )}
      {step === 3 && suggestedGrade && (
        <div>
          <h2 className="font-semibold mb-2">Suggested Grade</h2>
          <GradeBadge grade={suggestedGrade} commodity={commodity} size="lg" onClick={() => setShowModal(true)} />
          <div className="mt-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={() => setStep(4)}>
              Confirm & Submit
            </button>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setStep(2)}>
              Back
            </button>
          </div>
          <GradeCriteriaModal open={showModal} onClose={() => setShowModal(false)} commodity={commodity} grade={suggestedGrade} />
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="font-semibold mb-2">Submit Grading</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      )}
      {step === 5 && badgeUrl && (
        <div className="text-center">
          <h2 className="font-semibold mb-2">Grading Complete!</h2>
          <Image src={badgeUrl} alt="Grade Badge" width={120} height={120} className="mx-auto" />
          <div className="mt-2">Share this badge with buyers to prove your produce quality.</div>
        </div>
      )}
    </div>
  );
}
