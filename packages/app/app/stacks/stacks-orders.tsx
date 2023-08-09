"use client";

import { useCallback, useEffect, useState } from "react";
import { cx } from "class-variance-authority";
import { Tab } from "@headlessui/react";
import {
  StackOrder,
  filterActiveOrders,
  filterCancelledOrders,
  filterCompletedOrders,
  getStackOrders,
} from "@/models/stack-order";
import { ChainId } from "@stackly/sdk";
import { BodyText } from "@/ui";
import { StacksTable } from "@/components";
import EmptyState from "./empty-state";
import { getOrders } from "@/models/order";

export interface StackOrdersProps {
  address: string;
  chainId: ChainId;
}

export const StackOrders = ({ chainId, address }: StackOrdersProps) => {
  const [loading, setLoading] = useState(true);
  const [currentStackOrders, setCurrentStackOrders] = useState<StackOrder[]>(
    []
  );
  const activeOrders = filterActiveOrders(currentStackOrders);
  const completedOrders = filterCompletedOrders(currentStackOrders);
  const cancelledOrders = filterCancelledOrders(currentStackOrders);

  const fetchStacks = useCallback(() => {
    getOrders(chainId, address.toLowerCase())
      .then(async (orders) => {
        if (!orders || orders.length === 0) return;

        const stackOrders = await getStackOrders(chainId, orders);
        if (stackOrders.length > 0) setCurrentStackOrders(stackOrders);
      })
      .finally(() => setLoading(false));
  }, [address, chainId]);

  useEffect(() => fetchStacks(), [fetchStacks]);

  if (!loading && currentStackOrders.length === 0) return <EmptyState />;

  return (
    <div className="space-y-6">
      <Tab.Group>
        <Tab.List>
          <div className="flex space-x-2">
            <Tab
              as="button"
              className="px-3 py-1.5 font-semibold rounded-lg ui-selected:bg-surface-75 ui-not-selected:text-em-low outline-none active:ring-2 active:ring-gray-100"
            >
              Active Stacks
            </Tab>
            <Tab
              as="button"
              className="px-3 py-1.5 font-semibold rounded-lg ui-selected:bg-surface-75 ui-not-selected:text-em-low outline-none active:ring-2 active:ring-gray-100"
            >
              Completed stacks
            </Tab>
            <Tab
              as="button"
              className="px-3 py-1.5 font-semibold rounded-lg ui-selected:bg-surface-75 ui-not-selected:text-em-low outline-none active:ring-2 active:ring-gray-100"
            >
              Cancelled stacks
            </Tab>
          </div>
        </Tab.List>
        <Tab.Panels>
          {loading ? (
            <EmptyStacks className="animate-pulse" text="Loading..." />
          ) : (
            <>
              <Tab.Panel>
                {activeOrders.length ? (
                  <StacksTable
                    stackOrders={activeOrders}
                    refetchStacks={fetchStacks}
                  />
                ) : (
                  <EmptyStacks text="No active stacks" />
                )}
              </Tab.Panel>
              <Tab.Panel>
                {completedOrders.length ? (
                  <StacksTable
                    stackOrders={completedOrders}
                    refetchStacks={fetchStacks}
                  />
                ) : (
                  <EmptyStacks text="No completed stacks" />
                )}
              </Tab.Panel>
              <Tab.Panel>
                {cancelledOrders.length ? (
                  <StacksTable
                    stackOrders={cancelledOrders}
                    refetchStacks={fetchStacks}
                  />
                ) : (
                  <EmptyStacks text="No cancelled stacks" />
                )}
              </Tab.Panel>
            </>
          )}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

const EmptyStacks = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <div className="py-12 bg-white rounded-xl">
    <BodyText className={cx("text-center text-em-low", className)}>
      {text}
    </BodyText>
  </div>
);
