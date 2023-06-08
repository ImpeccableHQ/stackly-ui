import { CellWrapper } from "./CellWrapper";
import { Order } from "@/app/stacks/page";
import {
  BodyText,
  Button,
  CaptionText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui";
import { currentTimestampInSeconds } from "@/utils/time";

const mockCowOrders = [
  {
    creationDate: "2023-06-01T17:47:21.439282Z",
    owner: "0x68b57d8b652aee685c6b8c387616911eca5ed883",
    uid: "0x86c95122ed312f02fa9904e8b9d5b19c70317eac0dc0a207bf4d4b36e6686f2668b57d8b652aee685c6b8c387616911eca5ed8836478e024",
    availableBalance: null,
    executedBuyAmount: "182201661599561308717",
    executedSellAmount: "13783979663205039289",
    executedSellAmountBeforeFees: "13783979663205039289",
    executedFeeAmount: "0",
    invalidated: false,
    status: "fulfilled",
    class: "limit",
    surplusFee: "4855798329137440",
    surplusFeeTimestamp: "2023-06-01T17:47:25.339953Z",
    executedSurplusFee: "4855798329137440",
    settlementContract: "0x9008d19f58aabd9ed0d60971565aa8510560ab41",
    fullFeeAmount: "4855798329137440",
    solverFee: "4855798329137440",
    isLiquidityOrder: false,
    sellToken: "0xe91d153e0b41518a2ce8dd3d7944fa863463a97d",
    buyToken: "0x177127622c4a00f3d409b75571e12cb3c8973d3c",
    receiver: "0x05a4ed2367bd2f0aa63cc14897850be7474bc722",
    sellAmount: "13783979663205039289",
    buyAmount: "1",
    validTo: 1685643300,
    appData:
      "0x9b5c6dfa0fa4be89e17700f05bee8775b281aa6d2dac7dfbf3945e0f9642d777",
    feeAmount: "0",
    kind: "sell",
    partiallyFillable: false,
    sellTokenBalance: "erc20",
    buyTokenBalance: "erc20",
    signingScheme: "eip1271",
    signature:
      "0x000000000000000000000000e91d153e0b41518a2ce8dd3d7944fa863463a97d000000000000000000000000177127622c4a00f3d409b75571e12cb3c8973d3c00000000000000000000000005a4ed2367bd2f0aa63cc14897850be7474bc722000000000000000000000000000000000000000000000000bf4a8879188b7cb90000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000006478e0249b5c6dfa0fa4be89e17700f05bee8775b281aa6d2dac7dfbf3945e0f9642d7770000000000000000000000000000000000000000000000000000000000000000f3b277728b3fee749481eb3e0b3b48980dbbab78658fc419025cb16eee34677500000000000000000000000000000000000000000000000000000000000000005a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc95a28e9363bb942b639270062aa6bb295f434bcdfc42c97267bf003f272060dc9",
    interactions: {
      pre: [],
      post: [],
    },
  },
];

// mock function to be replaced
const getCowOrders = (order: Order) => mockCowOrders;

// we'll probably use viem/ethers function when we connect to data
const convertedAmount = (amount: string | number, decimals: number) =>
  Number(amount) / 10 ** decimals;

const calculateAveragePrice = (order: Order) => {
  let totalExecutedBuyAmount = 0;
  let totalExecutedSellAmount = 0;
  getCowOrders(order).forEach((cowOrder) => {
    if (cowOrder.executedBuyAmount === "0") return;

    totalExecutedBuyAmount += convertedAmount(
      cowOrder.executedBuyAmount,
      order.buyToken.decimals
    );
    totalExecutedSellAmount += convertedAmount(
      cowOrder.executedSellAmount,
      order.sellToken.decimals
    );
  });
  const averagePrice = totalExecutedSellAmount / totalExecutedBuyAmount;
  return averagePrice;
};

const ordersDone = (order: Order) => {
  return order.orderSlots.reduce((count, orderTimestamp) => {
    if (Number(orderTimestamp) < currentTimestampInSeconds) return ++count;

    return count;
  }, 0);
};

const totalFundsUsed = (order: Order) =>
  Number(buyAmountPerSlot(order)) * ordersDone(order);

const buyAmountPerSlot = (order: Order) =>
  convertedAmount(
    Number(order.amount) / order.orderSlots.length,
    order.buyToken.decimals
  );

const totalStacked = (order: Order) =>
  getCowOrders(order).reduce((acc, cowOrder) => {
    return (
      acc + convertedAmount(cowOrder.executedBuyAmount, order.buyToken.decimals)
    );
  }, 0);

const getPairSymbols = (order: Order) =>
  `${order.buyToken.symbol}/${order.sellToken.symbol}`;

export const StacksTable = ({ orders }: { orders: Order[] }) => (
  <div className="w-full bg-white border h-96 rounded-3xl border-surface-50">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stack</TableHead>
          <TableHead className="text-right">Used funds</TableHead>
          <TableHead className="text-right">Avg. Buy Price</TableHead>
          <TableHead className="text-right">Progress</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="flex items-center font-medium">
              <div className="flex items-end">
                <div className="flex items-center justify-center w-10 h-10 text-[10px] border-2 rounded-full border-primary-400 bg-primary-100">
                  {order.buyToken.symbol.substring(0, 4)}
                </div>
                <div className="flex items-center justify-center w-5 h-5 -ml-2 text-[8px]  border-primary-400 border rounded-full bg-primary-200">
                  {order.sellToken.symbol.substring(2, 5)}
                </div>
              </div>
              <div className="ml-3 space-y-0.5">
                <BodyText weight="bold">
                  {totalStacked(order).toFixed(3)}
                </BodyText>
                <CaptionText className="text-em-low">
                  {getPairSymbols(order)}
                </CaptionText>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <CellWrapper>
                <BodyText className="text-em-high">
                  {totalFundsUsed(order).toFixed(2)}
                </BodyText>
                <BodyText className="text-em-low">
                  /{" "}
                  {convertedAmount(
                    order.amount,
                    order.buyToken.decimals
                  ).toFixed(2)}{" "}
                  {order.sellToken.symbol}
                </BodyText>
              </CellWrapper>
            </TableCell>
            <TableCell className="text-right">
              <CellWrapper>
                <BodyText className="text-em-high">
                  {calculateAveragePrice(order).toFixed(3)}
                </BodyText>
                <BodyText className="text-em-low">
                  {getPairSymbols(order)}
                </BodyText>
              </CellWrapper>
            </TableCell>
            <TableCell className="text-right">
              <CellWrapper>
                <BodyText className="text-em-high">
                  {ordersDone(order).toString()}
                </BodyText>
                <BodyText className="text-em-low">
                  / {order.orderSlots.length} orders
                </BodyText>
              </CellWrapper>
            </TableCell>
            <TableCell className="flex justify-end">
              <Button
                className="w-max"
                size="sm"
                action="tertiary"
                onClick={() => console.log("open modal")}
              >
                View details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
