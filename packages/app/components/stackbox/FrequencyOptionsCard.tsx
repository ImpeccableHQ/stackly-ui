"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { add, daysToWeeks } from "date-fns";
import { twMerge } from "tailwind-merge";

import { useStrategyContext } from "@/contexts";
import { FREQUENCY_OPTIONS } from "@/models";
import { BodyText, RadioButton, TextInput } from "@/ui";
import { cx } from "class-variance-authority";

interface FrequencyOptionsCardProps {
  frequency: FREQUENCY_OPTIONS;
  setEndDate: (date: Date) => void;
}

const defaultFrequencyOptions = {
  [FREQUENCY_OPTIONS.hour]: ["6", "12", "24"],
  [FREQUENCY_OPTIONS.day]: ["7", "15", "30"],
  [FREQUENCY_OPTIONS.week]: ["4", "8", "12"],
  [FREQUENCY_OPTIONS.month]: ["2", "6", "12"],
};
const maxCustomFrequencies = {
  [FREQUENCY_OPTIONS.hour]: 96,
  [FREQUENCY_OPTIONS.day]: 365,
  [FREQUENCY_OPTIONS.week]: 52,
  [FREQUENCY_OPTIONS.month]: 24,
};
const postiveIntegerOnlyRegex = /^[1-9][0-9]*$/;

const getDefaultEndDateFrequency = (
  frequency: FREQUENCY_OPTIONS,
  timeAmount: number
) => {
  switch (frequency) {
    case FREQUENCY_OPTIONS.hour:
      return add(new Date(), { hours: timeAmount });
    case FREQUENCY_OPTIONS.day:
      return add(new Date(), { days: timeAmount });
    case FREQUENCY_OPTIONS.week:
      return add(new Date(), { weeks: timeAmount });
    case FREQUENCY_OPTIONS.month:
      return add(new Date(), { months: timeAmount });
    default: {
      console.error("Invalid frequency option", frequency);
      return new Date();
    }
  }
};

const getCroppedFrequency = (frequency: FREQUENCY_OPTIONS) => {
  const isMonthFrequency = frequency === FREQUENCY_OPTIONS.month;

  return isMonthFrequency ? frequency.substring(0, 2) : frequency.charAt(0);
};

const parseDaysToFrequencyAmount = (
  days: number,
  frequency: FREQUENCY_OPTIONS
) => {
  switch (frequency) {
    case FREQUENCY_OPTIONS.hour:
      return days * 24;
    case FREQUENCY_OPTIONS.day:
      return days;
    case FREQUENCY_OPTIONS.week:
      return daysToWeeks(days);
    case FREQUENCY_OPTIONS.month:
      return days / 30;
    default: {
      console.error("Invalid frequency option", frequency);
      return maxCustomFrequencies[frequency];
    }
  }
};

export const FrequencyOptionsCard = ({
  frequency,
  setEndDate,
}: FrequencyOptionsCardProps) => {
  const [defaultFrequency, setDefaultFrequency] = useState(
    defaultFrequencyOptions[frequency][0]
  );
  const [customFrequency, setCustomFrequency] = useState("");

  const { deselectStrategy, selectedStrategy } = useStrategyContext();

  const handleCustomFrequencyChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (!newValue) {
      setCustomFrequency("");
      setDefaultFrequency(defaultFrequencyOptions[frequency][0]);
      return;
    }

    const isWithinRange = Number(newValue) <= maxCustomFrequencies[frequency];
    const isValidNumber =
      postiveIntegerOnlyRegex.test(newValue) && isWithinRange;

    if (isValidNumber) {
      setDefaultFrequency("");
      setCustomFrequency(newValue);
    }

    if (selectedStrategy) deselectStrategy();
  };

  useEffect(() => {
    setDefaultFrequency(defaultFrequencyOptions[frequency][0]);
    if (!!customFrequency) setCustomFrequency("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency]);

  useEffect(() => {
    const newFrequency = customFrequency ? customFrequency : defaultFrequency;

    setEndDate(getDefaultEndDateFrequency(frequency, Number(newFrequency)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFrequency, customFrequency]);

  useEffect(() => {
    if (selectedStrategy) {
      const frequencyAmount = parseDaysToFrequencyAmount(
        selectedStrategy.daysAmount,
        frequency
      ).toString();

      const isDefaultStrategy =
        defaultFrequencyOptions[frequency].includes(frequencyAmount);

      if (isDefaultStrategy) {
        setDefaultFrequency(frequencyAmount);
        setCustomFrequency("");
      } else {
        setCustomFrequency(frequencyAmount);
        setDefaultFrequency("");
      }
    }
  }, [frequency, selectedStrategy]);

  return (
    <div
      className={twMerge([
        "flex flex-col p-3 rounded-2xl gap-1",
        "bg-surface-25 border border-surface-50",
      ])}
    >
      <BodyText className="text-em-low">Total duration of the stack</BodyText>
      <div className="flex gap-2 flex-col md:flex-row">
        <div className="flex gap-2">
          {defaultFrequencyOptions[frequency].map((freqOption) => {
            const isSelected = defaultFrequency === freqOption;

            return (
              <RadioButton
                checked={isSelected}
                className="min-w-[70px] h-10"
                id={freqOption}
                key={freqOption}
                name={freqOption}
                onChange={(event) => {
                  setDefaultFrequency(event.target.value as FREQUENCY_OPTIONS);
                  if (!!customFrequency) setCustomFrequency("");
                  if (selectedStrategy) deselectStrategy();
                }}
                value={freqOption}
              >
                <BodyText
                  className={cx({ "text-em-med": !isSelected })}
                  size={2}
                >
                  {`${freqOption} ${getCroppedFrequency(frequency)}`}
                </BodyText>
              </RadioButton>
            );
          })}
        </div>
        <TextInput
          id="custom-frequency-option"
          onChange={handleCustomFrequencyChange}
          placeholder={`Custom ${frequency} (max: ${maxCustomFrequencies[frequency]})`}
          value={customFrequency}
        />
      </div>
    </div>
  );
};
